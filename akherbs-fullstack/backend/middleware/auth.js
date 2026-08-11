const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Verifies JWT and attaches { id, role } to req.user
function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired.' });
  }
}

// Only allows requests where req.user.role === 'user'
function requireUser(req, res, next) {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ message: 'Customer account required.' });
  }
  next();
}

// Only allows requests where req.user.role === 'admin'
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin account required.' });
  }
  next();
}

module.exports = { protect, requireUser, requireAdmin, User, Admin };
