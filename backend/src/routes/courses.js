const express = require('express');
const Course = require('../models/Course');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all published courses with pagination, search, sort, filter
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
    
    const courses = await Course.find(filter)
      .populate('instructor', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(filter);
    
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
      instructorName: req.user.name
    });
    
    await course.save();
    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
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

// Get user's enrolled courses
router.get('/enrolled', authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ 
      enrolledStudents: req.user.id,
      isPublished: true 
    })
    .populate('instructor', 'name')
    .sort({ createdAt: -1 });
    
    res.json({ 
      courses,
      count: courses.length 
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in course
router.post('/:id/enroll', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    
    course.enrolledStudents.push(req.user.id);
    await course.save();
    
    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Enroll error:', error);
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

// Create sample courses (for testing)
router.post('/seed/sample', async (req, res) => {
  try {
    // Clear existing sample courses first
    await Course.deleteMany({ instructorName: { $in: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Chen'] } });
    
    const sampleCourses = [
      {
        title: 'React.js Fundamentals',
        description: 'Learn the basics of React.js and build modern web applications with hooks, components, and state management.',
        category: 'Technology',
        level: 'Beginner',
        price: 0,
        instructor: new require('mongoose').Types.ObjectId(),
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
        instructor: new require('mongoose').Types.ObjectId(),
        instructorName: 'Jane Smith',
        isPublished: true,
        rating: 4.8,
        totalRatings: 89
      },
      {
        title: 'Digital Marketing Strategy',
        description: 'Learn effective digital marketing strategies for modern businesses including SEO, social media, and analytics.',
        category: 'Marketing',
        level: 'Intermediate',
        price: 29,
        instructor: new require('mongoose').Types.ObjectId(),
        instructorName: 'Mike Johnson',
        isPublished: true,
        rating: 4.3,
        totalRatings: 67
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Master the fundamentals of user interface and user experience design with practical projects.',
        category: 'Design',
        level: 'Beginner',
        price: 39,
        instructor: new require('mongoose').Types.ObjectId(),
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
        instructor: new require('mongoose').Types.ObjectId(),
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