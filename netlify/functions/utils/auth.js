const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId) => {
  const tokenId = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { userId, tokenId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { token, tokenId };
};

// Verify JWT token
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password with hash
const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate reset token
const generateResetToken = () => {
  return {
    token: crypto.randomBytes(32).toString('hex'),
    expires: new Date(Date.now() + 3600000) // 1 hour from now
  };
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  generateResetToken
};
