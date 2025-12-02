/**
 * Authentication Middleware
 * Verifies JWT tokens and checks admin privileges
 */

const jwt = require('jsonwebtoken');
const { db } = require('../firebase');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bJWQAQegyJEXbSqZoREfwGYmNtQZjx6oGZ0UOCjmnOvPCHNrBX0cLhKEKEGRX16cWfKfclV7wDuJeRISECkQbw==');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Authorization failed' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};

