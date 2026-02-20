const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'dev_secret_key',
    { expiresIn: '7d' }
  );
};

const sanitizeUser = (userDoc) => {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    age: userDoc.age,
    healthConditions: userDoc.healthConditions,
    smokingStatus: userDoc.smokingStatus,
    createdAt: userDoc.createdAt
  };
};

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age = 30,
      healthConditions = ['none'],
      smokingStatus = 'non-smoker'
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const user = new User({
      name,
      email,
      password,
      age,
      healthConditions,
      smokingStatus
    });

    await user.save();

    const token = createToken(user._id);
    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to signup',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user._id);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to login',
      message: error.message
    });
  }
};

exports.me = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: sanitizeUser(req.currentUser)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
};

exports.updateHealthProfile = async (req, res) => {
  try {
    const { age, healthConditions, smokingStatus, name } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (age !== undefined) updates.age = age;
    if (healthConditions !== undefined) updates.healthConditions = healthConditions;
    if (smokingStatus !== undefined) updates.smokingStatus = smokingStatus;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update health profile',
      message: error.message
    });
  }
};
