const express = require('express');
const Course = require('../models/Course');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    let filter = { isPublished: true };


    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = -1;

    let courses = await Course.find(filter)
      .populate('instructor', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    let total = await Course.countDocuments(filter);



    if (total === 0 && category && !search && !level) {
      console.log(`No courses found for ${category}. Generating AI courses...`);
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          Generate 5-6 realistic, high-quality, professional online courses SPECIFICALLY for the "${category}" industry for a learning platform.
          Context: Indian Market. Prices in INR (0 for free, or 499-4999).
          
          Return ONLY a valid JSON array of objects with this structure:
          [
            {
              "title": "Course Title",
              "description": "Detailed description (2-3 sentences)",
              "category": "${category}",
              "level": "Beginner" | "Intermediate" | "Advanced",
              "price": number,
              "instructorName": "Professional Name",
              "rating": 4.5,
              "totalRatings": 120
            }
          ]
        `;

        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        console.log('Gemini Raw Response:', text);

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const generatedCourses = JSON.parse(text);
        console.log('Parsed Courses:', generatedCourses.length);


        const newCourses = generatedCourses.map(c => ({
          ...c,
          category: category, // Enforce category
          instructor: new mongoose.Types.ObjectId(),
          isPublished: true,
          lectures: [],
          createdAt: new Date()
        }));

        if (newCourses.length > 0) {
          await Course.insertMany(newCourses);
          console.log(`Successfully generated ${newCourses.length} courses for ${category}`);

          // Refetch to get the newly created courses
          courses = await Course.find(filter)
            .populate('instructor', 'name')
            .sort(sortOptions)
            .limit(limit * 1);

          total = await Course.countDocuments(filter);
        }
      } catch (aiError) {
        console.error('AI Course Generation Failed:', aiError.message);


        console.log(`Generating fallback courses for ${category}...`);
        const fallbackCourses = [
          {
            title: `${category} Fundamentals`,
            description: `A comprehensive introduction to ${category}, covering key concepts and industry standards. Ideal for beginners looking to start their career.`,
            category: category,
            level: 'Beginner',
            price: 0,
            instructor: new mongoose.Types.ObjectId(),
            instructorName: 'RexAI Expert',
            rating: 4.5,
            totalRatings: 125,
            isPublished: true,
            lectures: [],
            createdAt: new Date()
          },
          {
            title: `Advanced ${category} Strategies`,
            description: `Master complex ${category} methodologies and strategic planning. Designed for professionals seeking to advance their expertise.`,
            category: category,
            level: 'Advanced',
            price: 2499,
            instructor: new mongoose.Types.ObjectId(),
            instructorName: 'Industry Leader',
            rating: 4.8,
            totalRatings: 89,
            isPublished: true,
            lectures: [],
            createdAt: new Date()
          },
          {
            title: `${category} in Practice`,
            description: `Hands-on practical application of ${category} principles. Includes real-world case studies and projects.`,
            category: category,
            level: 'Intermediate',
            price: 999,
            instructor: new mongoose.Types.ObjectId(),
            instructorName: 'Senior Practitioner',
            rating: 4.6,
            totalRatings: 210,
            isPublished: true,
            lectures: [],
            createdAt: new Date()
          },
          {
            title: `Future of ${category}`,
            description: `Explore emerging trends, technologies, and future directions in the ${category} industry. Stay ahead of the curve.`,
            category: category,
            level: 'Intermediate',
            price: 1499,
            instructor: new mongoose.Types.ObjectId(),
            instructorName: 'Tech Innovator',
            rating: 4.7,
            totalRatings: 156,
            isPublished: true,
            lectures: [],
            createdAt: new Date()
          }
        ];

        try {
          await Course.insertMany(fallbackCourses);
          console.log(`Successfully generated ${fallbackCourses.length} fallback courses for ${category}`);

          // Refetch to get the newly created courses
          courses = await Course.find(filter)
            .populate('instructor', 'name')
            .sort(sortOptions)
            .limit(limit * 1);

          total = await Course.countDocuments(filter);
        } catch (dbError) {
          console.error('Fallback generation failed:', dbError);
        }
      }
    }

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/enrolled', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching enrolled courses for user:', req.user.id);

    const courses = await Course.find({
      enrolledStudents: new mongoose.Types.ObjectId(req.user.id),
      isPublished: true
    })
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    console.log('Found enrolled courses:', courses.length);


    const coursesWithProgress = courses.map(course => ({
      ...course.toObject(),
      progress: 0
    }));

    res.json({
      courses: coursesWithProgress,
      count: coursesWithProgress.length
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/my/courses', authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    console.log('Enrolling user:', req.user.id, 'in course:', req.params.id);

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled using ObjectId comparison
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const isAlreadyEnrolled = course.enrolledStudents.some(studentId =>
      studentId.equals(userObjectId)
    );

    if (isAlreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    course.enrolledStudents.push(userObjectId);
    await course.save();

    console.log('Successfully enrolled. Total enrolled students:', course.enrolledStudents.length);

    res.json({ message: 'Enrolled successfully', courseId: course._id });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    const course = new Course({
      title,
      description,
      category,
      level,
      price: price || 0,
      instructor: req.user.id,
      instructorName: req.user.name,
      isPublished: true
    });

    await course.save();
    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, level, price } = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user.id },
      { title, description, category, level, price },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user.id
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});







module.exports = router;