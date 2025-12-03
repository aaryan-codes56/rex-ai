const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    const userResponse = user.toJSON();
    delete userResponse.password;
    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const passwordMatch = await user.comparePassword(password);
    console.log('Password match:', passwordMatch);
    
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    const userResponse = user.toJSON();
    console.log('Login successful, sending response:', { token: !!token, user: userResponse });
    
    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { register, login };