const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');

// @route   GET /api/investments
// @desc    Get all investments for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: investments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/investments
// @desc    Create new investment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, amount, currentValue, purchaseDate, quantity, purchasePrice, returns, notes } = req.body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Investment name is required' });
    }

    if (!type || type.trim() === '') {
      return res.status(400).json({ success: false, message: 'Investment type is required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const investment = new Investment({
      userId: req.userId,
      name,
      type,
      amount: parseFloat(amount),
      currentValue: currentValue ? parseFloat(currentValue) : parseFloat(amount),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      quantity: quantity ? parseFloat(quantity) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      returns: returns ? parseFloat(returns) : null,
      notes: notes || null
    });

    await investment.save();
    res.status(201).json({ success: true, message: 'Investment added successfully', data: investment });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   PUT /api/investments/:id
// @desc    Update investment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    res.json({ success: true, message: 'Investment updated successfully', data: investment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/investments/:id
// @desc    Delete investment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }

    res.json({ success: true, message: 'Investment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
