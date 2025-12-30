const express = require('express');
const Course = require('../models/Course');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();

// Get all published courses with pagination, search, sort, filter
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    let filter = { isPublished: true };

    // Strict category filtering
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

    // AI AUTO-GENERATION: If strictly filtering by category and no courses found
    console.log(`Checking AI Gen: total=${total}, category=${category}, search=${search}, level=${level}`);

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
        console.log('Gemini Raw Response:', text); // DEBUG LOG

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const generatedCourses = JSON.parse(text);
        console.log('Parsed Courses:', generatedCourses.length);

        // Sanitize and save
        const newCourses = generatedCourses.map(c => ({
          ...c,
          category: category, // Enforce category
          instructor: new mongoose.Types.ObjectId(), // Random ID for system generated
          isPublished: true,
          lectures: [], // Empty lectures for now
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

        // Fallback: Generate mock courses if AI fails
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

// Get user's enrolled courses (must come before /:id route)
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

    // Add mock progress for demo purposes
    const coursesWithProgress = courses.map(course => ({
      ...course.toObject(),
      progress: 0 // Default to 0 start
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

// Get user's courses (as instructor)
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

// Enroll in course (must come before /:id routes)
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

// Get single course
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

// Create new course (authenticated)
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



// Update course (authenticated)
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

// Delete course (authenticated)
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

// Debug endpoint to check enrolled courses
router.get('/debug/enrolled/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const courses = await Course.find({
      enrolledStudents: { $in: [userId] }
    });

    const allCourses = await Course.find({}).select('_id title enrolledStudents');

    res.json({
      userId,
      enrolledCoursesCount: courses.length,
      enrolledCourses: courses,
      allCoursesWithEnrollments: allCourses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test enrollment endpoint
router.post('/debug/test-enroll', async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    res.json({
      message: 'Test enrollment successful',
      courseTitle: course.title,
      enrolledStudents: course.enrolledStudents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed/sample', async (req, res) => {
  try {
    // Clear existing sample courses first
    await Course.deleteMany({ instructorName: { $in: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Chen', 'Alex Kumar', 'Lisa Wang', 'Robert Brown', 'Emma Davis', 'Carlos Rodriguez'] } });

    const sampleCourses = [
      // Technology Courses
      {
        title: 'React.js Fundamentals',
        description: 'Learn the basics of React.js and build modern web applications with hooks, components, and state management.',
        category: 'Technology',
        level: 'Beginner',
        price: 0,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'John Doe',
        isPublished: true,
        rating: 4.5,
        totalRatings: 120
      },
      {
        title: 'Advanced JavaScript',
        description: 'Master advanced JavaScript concepts including closures, prototypes, async/await, and ES6+ features.',
        category: 'Technology',
        level: 'Advanced',
        price: 49,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Jane Smith',
        isPublished: true,
        rating: 4.8,
        totalRatings: 89
      },
      {
        title: 'Full Stack Web Development',
        description: 'Complete course covering frontend and backend development with modern technologies.',
        category: 'Technology',
        level: 'Intermediate',
        price: 79,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Alex Kumar',
        isPublished: true,
        rating: 4.7,
        totalRatings: 203
      },
      {
        title: 'Cloud Computing with AWS',
        description: 'Learn cloud infrastructure, deployment, and scaling with Amazon Web Services.',
        category: 'Technology',
        level: 'Advanced',
        price: 99,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Lisa Wang',
        isPublished: true,
        rating: 4.6,
        totalRatings: 145
      },
      // Finance Courses
      {
        title: 'Financial Analysis Fundamentals',
        description: 'Master financial statement analysis, ratios, and valuation techniques for investment decisions.',
        category: 'Finance',
        level: 'Beginner',
        price: 59,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Robert Brown',
        isPublished: true,
        rating: 4.4,
        totalRatings: 87
      },
      {
        title: 'Investment Portfolio Management',
        description: 'Learn portfolio theory, risk management, and asset allocation strategies.',
        category: 'Finance',
        level: 'Intermediate',
        price: 89,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Emma Davis',
        isPublished: true,
        rating: 4.5,
        totalRatings: 112
      },
      {
        title: 'Cryptocurrency and Blockchain',
        description: 'Understanding digital currencies, blockchain technology, and DeFi applications.',
        category: 'Finance',
        level: 'Intermediate',
        price: 0,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Carlos Rodriguez',
        isPublished: true,
        rating: 4.3,
        totalRatings: 156
      },
      // Healthcare Courses
      {
        title: 'Healthcare Data Analytics',
        description: 'Analyze healthcare data to improve patient outcomes and operational efficiency.',
        category: 'Healthcare',
        level: 'Intermediate',
        price: 69,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Dr. Sarah Wilson',
        isPublished: true,
        rating: 4.6,
        totalRatings: 78
      },
      {
        title: 'Medical Device Regulations',
        description: 'Navigate FDA regulations and compliance requirements for medical devices.',
        category: 'Healthcare',
        level: 'Advanced',
        price: 129,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Dr. Mike Johnson',
        isPublished: true,
        rating: 4.7,
        totalRatings: 45
      },
      {
        title: 'Telemedicine Implementation',
        description: 'Learn to implement and manage telehealth solutions in healthcare organizations.',
        category: 'Healthcare',
        level: 'Beginner',
        price: 0,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Dr. Lisa Wang',
        isPublished: true,
        rating: 4.4,
        totalRatings: 92
      },
      // Marketing Courses
      {
        title: 'Digital Marketing Strategy',
        description: 'Learn effective digital marketing strategies for modern businesses including SEO, social media, and analytics.',
        category: 'Marketing',
        level: 'Intermediate',
        price: 29,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Mike Johnson',
        isPublished: true,
        rating: 4.3,
        totalRatings: 67
      },
      {
        title: 'Social Media Marketing Mastery',
        description: 'Master social media platforms, content creation, and audience engagement strategies.',
        category: 'Marketing',
        level: 'Beginner',
        price: 39,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Emma Davis',
        isPublished: true,
        rating: 4.5,
        totalRatings: 134
      },
      {
        title: 'Email Marketing Automation',
        description: 'Build automated email campaigns that convert leads into customers.',
        category: 'Marketing',
        level: 'Intermediate',
        price: 0,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Carlos Rodriguez',
        isPublished: true,
        rating: 4.2,
        totalRatings: 89
      },
      // Education Courses
      {
        title: 'Online Course Creation',
        description: 'Learn to create, market, and sell online courses effectively.',
        category: 'Education',
        level: 'Beginner',
        price: 49,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Dr. Sarah Wilson',
        isPublished: true,
        rating: 4.6,
        totalRatings: 167
      },
      {
        title: 'Educational Technology Integration',
        description: 'Integrate technology tools and platforms into educational curricula.',
        category: 'Education',
        level: 'Intermediate',
        price: 59,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Alex Kumar',
        isPublished: true,
        rating: 4.4,
        totalRatings: 73
      },
      {
        title: 'Student Assessment Strategies',
        description: 'Develop effective assessment methods for measuring student learning outcomes.',
        category: 'Education',
        level: 'Advanced',
        price: 0,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Dr. Lisa Wang',
        isPublished: true,
        rating: 4.5,
        totalRatings: 56
      },
      // Design & Data Science
      {
        title: 'UI/UX Design Principles',
        description: 'Master the fundamentals of user interface and user experience design with practical projects.',
        category: 'Design',
        level: 'Beginner',
        price: 39,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'Sarah Wilson',
        isPublished: true,
        rating: 4.6,
        totalRatings: 95
      },
      {
        title: 'Data Science with Python',
        description: 'Complete guide to data science using Python, pandas, numpy, and machine learning libraries.',
        category: 'Data Science',
        level: 'Intermediate',
        price: 0,
        instructor: new mongoose.Types.ObjectId(),
        instructorName: 'David Chen',
        isPublished: true,
        rating: 4.7,
        totalRatings: 156
      }
    ];

    const createdCourses = await Course.insertMany(sampleCourses);
    res.json({
      message: 'Sample courses created successfully',
      count: createdCourses.length,
      courses: createdCourses
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;