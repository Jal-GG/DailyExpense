// routes/auth.js
import express from 'express';
import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, mobile } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, mobile });

  try {
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Set the token as a cookie
  res.cookie('token', token, {
    httpOnly: true, // Helps prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    expires: new Date(Date.now() + 3600000) // Cookie expiration time
  });

  res.status(200).json({ message: 'Logged in successfully' });
});

export default router;
