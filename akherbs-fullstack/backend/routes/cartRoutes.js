const express = require('express');
const User = require('../models/User');
const { protect, requireUser } = require('../middleware/auth');

const router = express.Router();

// POST /api/cart/:productId — add product to logged-in user's cart
router.post('/:productId', protect, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart.push(req.params.productId);
    await user.save();
    await user.populate('cart');
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/cart/:productId — remove ONE instance of product from cart
router.delete('/:productId', protect, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.cart.findIndex((p) => p.toString() === req.params.productId);
    if (idx !== -1) user.cart.splice(idx, 1);
    await user.save();
    await user.populate('cart');
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/cart — get current cart
router.get('/', protect, requireUser, async (req, res) => {
  const user = await User.findById(req.user.id).populate('cart');
  res.json({ cart: user.cart });
});

module.exports = router;
