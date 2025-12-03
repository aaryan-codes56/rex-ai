const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// AI Career Recommendations
router.post('/recommend', authMiddleware, async (req, res) => {
  try {
    const { skills, interests, experience } = req.body;
    
    // Mock AI recommendations for now
    const recommendations = [
      {
        title: 'Full Stack Developer',
        match: 95,
        description: 'Build end-to-end web applications',
        skills: ['React', 'Node.js', 'MongoDB'],
        salary: '$70k - $120k'
      },
      {
        title: 'Data Scientist',
        match: 88,
        description: 'Analyze data to drive business decisions',
        skills: ['Python', 'Machine Learning', 'SQL'],
        salary: '$80k - $140k'
      }
    ];
    
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;