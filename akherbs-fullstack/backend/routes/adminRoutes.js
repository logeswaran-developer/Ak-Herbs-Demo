const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/admin/register  — requires access code
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, code } = req.body;
    if (!name || !email || !password || !code) {
      return res.status(400).json({ message: 'All fields including access code are required.' });
    }
    if (code !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(403).json({ message: 'Invalid admin access code.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An admin account with this email already exists.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email: email.toLowerCase(), password: hashed });
    const token = signToken(admin._id, 'admin');
    res.status(201).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during admin registration.', error: err.message });
  }
});

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ message: 'Incorrect admin email or password.' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Incorrect admin email or password.' });

    const token = signToken(admin._id, 'admin');
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during admin login.', error: err.message });
  }
});

// GET /api/admin/me
router.get('/me', protect, requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.user.id).select('-password');
  if (!admin) return res.status(404).json({ message: 'Admin not found.' });
  res.json({ admin });
});

const Order = require('../models/Order');

// GET /api/admin/stats  — dashboard counters
router.get('/stats', protect, requireAdmin, async (req, res) => {
  try {
    const [products, users, admins, messages, orders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Admin.countDocuments(),
      Contact.countDocuments(),
      Order.countDocuments(),
    ]);
    res.json({ products, users, admins, messages, orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/admin/users  — list registered customers
router.get('/users', protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/admin/orders — list all customer orders
router.get('/orders', protect, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/admin/orders/:id/status — update order status
router.put('/orders/:id/status', protect, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});


module.exports = router;
