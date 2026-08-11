const express = require('express');
const Contact = require('../models/Contact');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/contact — public, submit an enquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }
    await Contact.create({ name, email, phone, message });
    res.status(201).json({ message: "Thank you! Your message has been received — we'll get back to you soon." });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/contact — admin only, view enquiries
router.get('/', protect, requireAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
