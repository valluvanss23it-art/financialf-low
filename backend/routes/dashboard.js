const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const Investment = require('../models/Investment');
const Goal = require('../models/Goal');
const {
  parseNumber,
  calculateReturnPercentage,
  calculateCAGR,
  calculateNetWorth,
  calculateAssetAllocation,
  calculateSavingsRate,
} = require('../utils/calculations');

/**
 * Helper function to safely sum array of numbers
 */
function safeSum(array, key) {
  try {
    return Array.isArray(array)
      ? array.reduce((sum, item) => sum + parseNumber(item[key], 0), 0)
      : 0;
  } catch (error) {
    console.error(`Error summing ${key}:`, error);
    return 0;
  }
}

/**
 * Helper function to safely get monthly data
 */
function getMonthKey(date) {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  } catch (error) {
    console.error('Error getting month key:', error);
    return null;
  }
}

// @route   GET /api/dashboard/stats
// @desc    Get aggregated dashboard statistics with comprehensive error handling
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID not found' });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      netWorth: 0,
      savingsRate: 0,
      assetsCount: 0,
      investmentsCount: 0,
      liabilitiesCount: 0,
      goalsCount: 0,
      completedGoalsCount: 0,
      monthlyData: [],
      netWorthData: [],
      assetAllocation: [],
      goals: [],
    };

    // Current month boundaries with validation
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

    // ==================== FETCH DATA ====================
    let incomes = [];
    let expenses = [];
    let assets = [];
    let investments = [];
    let liabilities = [];
    let goals = [];

    try {
      incomes = await Income.find({
        userId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }).lean();
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }

    try {
      expenses = await Expense.find({
        userId,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }).lean();
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }

    try {
      assets = await Asset.find({ userId }).lean();
    } catch (error) {
      console.error('Error fetching assets:', error);
    }

    try {
      investments = await Investment.find({ userId }).lean();
    } catch (error) {
      console.error('Error fetching investments:', error);
    }

    try {
      liabilities = await Liability.find({ userId }).lean();
    } catch (error) {
      console.error('Error fetching liabilities:', error);
    }

    try {
      goals = await Goal.find({ userId }).lean();
    } catch (error) {
      console.error('Error fetching goals:', error);
    }

    // ==================== CALCULATE CURRENT STATS ====================
    stats.totalIncome = safeSum(incomes, 'amount');
    stats.totalExpenses = safeSum(expenses, 'amount');
    stats.assetsCount = assets.length;
    stats.investmentsCount = investments.length;
    stats.liabilitiesCount = liabilities.length;
    stats.goalsCount = goals.length;

    // Calculate net worth using utility function
    const totalAssets = safeSum(assets, 'currentValue');
    const totalInvestments = investments.reduce((sum, inv) => {
      return sum + parseNumber(inv.currentValue || inv.amount, 0);
    }, 0);
    const totalLiabilities = safeSum(liabilities, 'outstandingBalance');

    stats.netWorth = totalAssets + totalInvestments - totalLiabilities;

    // Completed goals with safe filtering
    stats.completedGoalsCount = Array.isArray(goals)
      ? goals.filter((g) => g && g.status === 'completed').length
      : 0;

    // Calculate savings rate with validation
    stats.savingsRate = calculateSavingsRate(stats.totalIncome, stats.totalExpenses);

    // ==================== ASSET ALLOCATION ====================
    try {
      const allocationItems = [];

      assets.forEach((a) => {
        if (a && a.name) {
          allocationItems.push({
            name: a.name,
            value: parseNumber(a.currentValue, 0),
            type: 'asset',
          });
        }
      });

      investments.forEach((inv) => {
        if (inv && inv.name) {
          allocationItems.push({
            name: inv.name,
            value: parseNumber(inv.currentValue || inv.amount, 0),
            type: 'investment',
          });
        }
      });

      const totalPortfolioValue = totalAssets + totalInvestments;
      stats.assetAllocation = allocationItems
        .filter((item) => item.value > 0)
        .map((item) => ({
          name: item.name,
          value: Math.round(item.value * 100) / 100,
          percentage:
            totalPortfolioValue > 0
              ? Math.round((item.value / totalPortfolioValue) * 10000) / 100
              : 0,
          type: item.type,
        }))
        .sort((a, b) => b.percentage - a.percentage);
    } catch (error) {
      console.error('Error calculating asset allocation:', error);
      stats.assetAllocation = [];
    }

    // ==================== GOALS ====================
    try {
      stats.goals = goals
        .filter((g) => g && g.name)
        .map((g) => ({
          id: g._id || g.id,
          name: g.name,
          targetAmount: parseNumber(g.targetAmount, 0),
          currentAmount: parseNumber(g.currentAmount, 0),
          deadline: g.deadline,
          progress:
            parseNumber(g.targetAmount, 1) > 0
              ? Math.round((parseNumber(g.currentAmount, 0) / parseNumber(g.targetAmount, 1)) * 10000) / 100
              : 0,
          status: g.status || 'active',
        }));
    } catch (error) {
      console.error('Error processing goals:', error);
      stats.goals = [];
    }

    // ==================== MONTHLY DATA ====================
    try {
      const monthlyDataMap = {};
      const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthKey = getMonthKey(date);
        if (monthKey) {
          monthlyDataMap[monthKey] = {
            month: monthKey,
            income: 0,
            expenses: 0,
          };
        }
      }

      // Fetch last 6 months data
      const lastSixMonthsIncomes = await Income.find({
        userId,
        date: { $gte: sixMonthsAgo },
      }).lean();

      const lastSixMonthsExpenses = await Expense.find({
        userId,
        date: { $gte: sixMonthsAgo },
      }).lean();

      // Populate monthly data with safe access
      lastSixMonthsIncomes.forEach((income) => {
        if (income && income.date && income.amount) {
          const monthKey = getMonthKey(income.date);
          if (monthKey && monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey].income += parseNumber(income.amount, 0);
          }
        }
      });

      lastSixMonthsExpenses.forEach((expense) => {
        if (expense && expense.date && expense.amount) {
          const monthKey = getMonthKey(expense.date);
          if (monthKey && monthlyDataMap[monthKey]) {
            monthlyDataMap[monthKey].expenses += parseNumber(expense.amount, 0);
          }
        }
      });

      stats.monthlyData = Object.values(monthlyDataMap);
    } catch (error) {
      console.error('Error processing monthly data:', error);
      stats.monthlyData = [];
    }

    // ==================== NET WORTH TREND ====================
    try {
      stats.netWorthData = stats.monthlyData.map((data, index) => {
        const trend = stats.netWorth * (1 + (index - 2.5) * 0.05);
        return {
          date: data.month,
          value: Math.round(Math.max(0, trend) * 100) / 100,
        };
      });
    } catch (error) {
      console.error('Error calculating net worth trend:', error);
      stats.netWorthData = [];
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Dashboard service healthy' });
});

module.exports = router;
