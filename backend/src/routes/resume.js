const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Mock resume storage (in production, use MongoDB)
let resumes = [];

// Get user's resumes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userResumes = resumes.filter(r => r.userId === req.user.id);
    res.json({ resumes: userResumes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update resume
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { personalInfo, experience, education, skills } = req.body;
    
    const resume = {
      id: Date.now().toString(),
      userId: req.user.id,
      personalInfo,
      experience,
      education,
      skills,
      createdAt: new Date()
    };
    
    resumes.push(resume);
    res.status(201).json({ resume });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resume
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { personalInfo, experience, education, skills } = req.body;
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id && r.userId === req.user.id);
    
    if (resumeIndex === -1) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resumes[resumeIndex] = {
      ...resumes[resumeIndex],
      personalInfo,
      experience,
      education,
      skills,
      updatedAt: new Date()
    };
    
    res.json({ resume: resumes[resumeIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete resume
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resumeIndex = resumes.findIndex(r => r.id === req.params.id && r.userId === req.user.id);
    
    if (resumeIndex === -1) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resumes.splice(resumeIndex, 1);
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;