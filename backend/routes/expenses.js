const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// @route   GET /api/expenses
// @desc    Get all expenses for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, merchant, description, date, payment_method, is_recurring, recurring_frequency } = req.body;

    // Validate required fields
    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    if (!merchant || merchant.trim() === '') {
      return res.status(400).json({ success: false, message: 'Merchant/vendor is required' });
    }

    const expense = new Expense({
      userId: req.userId,
      category,
      amount: parseFloat(amount),
      merchant,
      description: description || null,
      date: date ? new Date(date) : new Date(),
      payment_method: payment_method || null,
      is_recurring: is_recurring || false,
      recurring_frequency: is_recurring ? recurring_frequency : null
    });

    await expense.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Expense added successfully',
      data: expense 
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense updated successfully', data: expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
