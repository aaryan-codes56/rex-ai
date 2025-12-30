const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Debug endpoint to check user data in database
router.get('/user-data', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data for debugging
    res.json({
      message: 'User data from database',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        industry: user.industry,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Debug user data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dangerous: Clear all data
router.delete('/reset', async (req, res) => {
  try {
    const Course = require('../models/Course');
    const User = require('../models/User');

    // Optional: Add a secret key check for safety in production
    // if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) return res.status(403).json({ message: 'Forbidden' });

    await Course.deleteMany({});
    await User.deleteMany({});

    console.log('Database reset successful');
    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;