const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();


const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalInfo: {
    email: String,
    mobile: String,
    linkedin: String
  },
  summary: String,
  skills: String,
  experience: [{
    position: String,
    company: String,
    startDate: String,
    endDate: String,
    description: String,
    isCurrent: Boolean
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', resumeSchema);


router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching resumes for user:', req.user.id);
    const userResumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log('Found resumes in MongoDB:', userResumes.length);

    const formattedResumes = userResumes.map(resume => ({
      id: resume._id.toString(),
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }));

    console.log('Sending formatted resumes:', formattedResumes.length);
    res.json({ resumes: formattedResumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { personalInfo, experience, skills, summary } = req.body;
    console.log('Creating resume for user:', req.user.id);
    console.log('Resume data:', { personalInfo, experience, skills, summary });

    const resume = new Resume({
      userId: req.user.id,
      personalInfo,
      experience,
      skills,
      summary
    });

    const savedResume = await resume.save();
    console.log('Resume saved to MongoDB:', savedResume._id);

    const responseResume = {
      id: savedResume._id.toString(),
      personalInfo: savedResume.personalInfo,
      summary: savedResume.summary,
      skills: savedResume.skills,
      experience: savedResume.experience,
      createdAt: savedResume.createdAt
    };

    console.log('Sending response:', responseResume);
    res.status(201).json({ resume: responseResume });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { personalInfo, experience, skills, summary } = req.body;

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        personalInfo,
        experience,
        skills,
        summary,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const responseResume = {
      id: resume._id.toString(),
      personalInfo: resume.personalInfo,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    };

    res.json({ resume: responseResume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;