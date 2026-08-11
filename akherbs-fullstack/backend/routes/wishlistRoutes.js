const express = require('express');
const User = require('../models/User');
const { protect, requireUser } = require('../middleware/auth');

const router = express.Router();

// POST /api/wishlist/:productId — toggle a product in the wishlist
router.post('/:productId', protect, requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const pid = req.params.productId;
    const exists = user.wishlist.some((p) => p.toString() === pid);
    if (exists) {
      user.wishlist = user.wishlist.filter((p) => p.toString() !== pid);
    } else {
      user.wishlist.push(pid);
    }
    await user.save();
    await user.populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/wishlist
router.get('/', protect, requireUser, async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');
  res.json({ wishlist: user.wishlist });
});

module.exports = router;
