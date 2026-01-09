require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const courseRoutes = require('./routes/courses');
const careerRoutes = require('./routes/careers');
const resumeRoutes = require('./routes/resume');
const insightsRoutes = require('./routes/insights');

const app = express();


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Rex AI');
});

app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    env: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);


app.use('/api/courses', courseRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/interview', require('./routes/interview'));

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (!process.env.GEMINI_API_KEY) {
      console.warn('WARNING: GEMINI_API_KEY is not set. AI features will fall back to default data.');
    }

    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n=================================`);
      console.log(`\n=================================`);
      console.log(`🚀 REX AI SERVER RUNNING on ${PORT}`);
      console.log(`=================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});