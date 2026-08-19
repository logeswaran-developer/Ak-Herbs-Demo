const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, requireUser } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - Create a new order (Checkout)
router.post('/', protect, requireUser, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Shipping address details are required.' });
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
    });

    await order.save();

    // Clear user's cart after successful order creation
    const user = await User.findById(req.user.id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order.', error: err.message });
  }
});

// GET /api/orders - Get user's orders
router.get('/', protect, requireUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: err.message });
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', protect, requireUser, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order.', error: err.message });
  }
});

module.exports = router;
