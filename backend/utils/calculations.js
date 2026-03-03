/**
 * Financial Calculation Utilities
 * Production-grade calculation engine for portfolio analysis
 */

/**
 * Safely parse a numeric value with validation
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default value
 */
function parseNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return defaultValue;
  }

  return parsed;
}

/**
 * Calculate portfolio returns percentage
 * @param {number} currentValue - Current portfolio value
 * @param {number} investedAmount - Original invested amount
 * @returns {number} Return percentage (0-100)
 */
function calculateReturnPercentage(currentValue, investedAmount) {
  const current = parseNumber(currentValue, 0);
  const invested = parseNumber(investedAmount, 0);

  if (invested <= 0) {
    return 0;
  }

  const returnPercent = ((current - invested) / invested) * 100;
  return Math.round(returnPercent * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * CAGR = (Ending Value / Beginning Value)^(1 / Number of Years) - 1
 * @param {number} beginningValue - Initial investment amount
 * @param {number} endingValue - Current portfolio value
 * @param {number} years - Investment period in years
 * @returns {number} CAGR as percentage (0-100)
 */
function calculateCAGR(beginningValue, endingValue, years) {
  const beginning = parseNumber(beginningValue, 0);
  const ending = parseNumber(endingValue, 0);
  const yearsValue = parseNumber(years, 1);

  // Validate inputs
  if (beginning <= 0 || ending < 0 || yearsValue <= 0) {
    return 0;
  }

  try {
    // Avoid negative values in power calculation
    const ratio = Math.max(0, ending / beginning);
    const cagr = Math.pow(ratio, 1 / yearsValue) - 1;
    const cagrPercent = cagr * 100;

    // Return 0 if result is NaN or infinite
    if (!isFinite(cagrPercent)) {
      return 0;
    }

    return Math.round(cagrPercent * 100) / 100;
  } catch (error) {
    console.error('Error calculating CAGR:', error);
    return 0;
  }
}

/**
 * Calculate weighted average return across multiple investments
 * @param {Array} investments - Array of investment objects with amount and returns
 * @returns {number} Weighted average return percentage
 */
function calculateWeightedReturn(investments) {
  if (!Array.isArray(investments) || investments.length === 0) {
    return 0;
  }

  let totalAmount = 0;
  let totalWeightedReturn = 0;

  for (const inv of investments) {
    const amount = parseNumber(inv.amount, 0);
    const currentValue = parseNumber(inv.currentValue, amount);

    if (amount > 0) {
      const returnPercent = calculateReturnPercentage(currentValue, amount);
      totalWeightedReturn += returnPercent * amount;
      totalAmount += amount;
    }
  }

  if (totalAmount <= 0) {
    return 0;
  }

  const weightedReturn = totalWeightedReturn / totalAmount;
  return Math.round(weightedReturn * 100) / 100;
}

/**
 * Calculate portfolio diversification metrics
 * @param {Array} assets - Array of asset objects with values
 * @returns {Object} Asset allocation with percentages
 */
function calculateAssetAllocation(assets) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return {
      total: 0,
      allocation: [],
      herfindahlIndex: 0, // Concentration measure (0-1)
    };
  }

  const validAssets = assets
    .map((a) => ({
      ...a,
      value: parseNumber(a.value || a.currentValue || a.amount, 0),
    }))
    .filter((a) => a.value > 0);

  const total = validAssets.reduce((sum, a) => sum + a.value, 0);

  if (total <= 0) {
    return {
      total: 0,
      allocation: [],
      herfindahlIndex: 0,
    };
  }

  // Calculate allocation percentages
  const allocation = validAssets.map((a) => ({
    name: a.name || 'Unknown',
    value: a.value,
    percentage: Math.round((a.value / total) * 10000) / 100, // 2 decimal places
  }));

  // Calculate Herfindahl Index (concentration measure)
  const herfindahlIndex = allocation.reduce((sum, a) => {
    const percent = a.percentage / 100;
    return sum + percent * percent;
  }, 0);

  return {
    total: Math.round(total * 100) / 100,
    allocation,
    herfindahlIndex: Math.round(herfindahlIndex * 10000) / 10000,
  };
}

/**
 * Calculate savings rate
 * @param {number} income - Total income
 * @param {number} expenses - Total expenses
 * @returns {number} Savings rate percentage (0-100)
 */
function calculateSavingsRate(income, expenses) {
  const incomeValue = parseNumber(income, 0);
  const expensesValue = parseNumber(expenses, 0);

  if (incomeValue <= 0) {
    return 0;
  }

  const savingsRate = ((incomeValue - expensesValue) / incomeValue) * 100;
  return Math.max(0, Math.min(100, Math.round(savingsRate * 100) / 100)); // Clamp 0-100
}

/**
 * Calculate net worth trend
 * @param {Array} assets - Array of assets
 * @param {Array} liabilities - Array of liabilities
 * @param {Array} investments - Array of investments
 * @returns {number} Net worth
 */
function calculateNetWorth(assets, liabilities, investments) {
  const totalAssets = Array.isArray(assets)
    ? assets.reduce((sum, a) => sum + parseNumber(a.currentValue || a.value, 0), 0)
    : 0;

  const totalInvestments = Array.isArray(investments)
    ? investments.reduce((sum, i) => sum + parseNumber(i.currentValue || i.amount, 0), 0)
    : 0;

  const totalLiabilities = Array.isArray(liabilities)
    ? liabilities.reduce((sum, l) => sum + parseNumber(l.outstandingBalance || l.amount, 0), 0)
    : 0;

  const netWorth = totalAssets + totalInvestments - totalLiabilities;
  return Math.round(netWorth * 100) / 100;
}

/**
 * Calculate portfolio volatility (simplified standard deviation)
 * @param {Array} monthlyReturns - Array of monthly return percentages
 * @returns {number} Annualized volatility percentage
 */
function calculateVolatility(monthlyReturns) {
  if (!Array.isArray(monthlyReturns) || monthlyReturns.length < 2) {
    return 0;
  }

  const validReturns = monthlyReturns
    .map((r) => parseNumber(r, 0))
    .filter((r) => isFinite(r));

  if (validReturns.length < 2) {
    return 0;
  }

  const mean = validReturns.reduce((a, b) => a + b, 0) / validReturns.length;
  const squaredDiff = validReturns.map((r) => Math.pow(r - mean, 2));
  const variance = squaredDiff.reduce((a, b) => a + b, 0) / validReturns.length;
  const stdDev = Math.sqrt(variance);

  // Annualize the volatility (12 months)
  const annualizedVolatility = stdDev * Math.sqrt(12);
  return Math.round(annualizedVolatility * 100) / 100;
}

/**
 * Calculate future value of investment
 * FV = PV * (1 + r)^n
 * @param {number} presentValue - Current investment amount
 * @param {number} annualRate - Annual return rate (as percentage, e.g., 10 for 10%)
 * @param {number} years - Investment period in years
 * @returns {number} Future value
 */
function calculateFutureValue(presentValue, annualRate, years) {
  const pv = parseNumber(presentValue, 0);
  const rate = parseNumber(annualRate, 0) / 100;
  const yearsValue = parseNumber(years, 1);

  if (pv <= 0) {
    return 0;
  }

  try {
    const fv = pv * Math.pow(1 + rate, yearsValue);
    return Math.round(fv * 100) / 100;
  } catch (error) {
    console.error('Error calculating future value:', error);
    return 0;
  }
}

/**
 * Calculate time to reach investment goal
 * n = log(FV/PV) / log(1 + r)
 * @param {number} currentAmount - Current investment amount
 * @param {number} goalAmount - Target goal amount
 * @param {number} annualRate - Expected annual return rate (percentage)
 * @returns {number} Years needed to reach goal (0 if impossible)
 */
function calculateTimeToGoal(currentAmount, goalAmount, annualRate) {
  const current = parseNumber(currentAmount, 0);
  const goal = parseNumber(goalAmount, 0);
  const rate = parseNumber(annualRate, 0) / 100;

  if (current <= 0 || goal <= 0 || goal <= current) {
    return 0;
  }

  if (rate <= 0) {
    return 0; // Impossible without returns
  }

  try {
    const years = Math.log(goal / current) / Math.log(1 + rate);
    return Math.max(0, Math.round(years * 100) / 100);
  } catch (error) {
    console.error('Error calculating time to goal:', error);
    return 0;
  }
}

module.exports = {
  parseNumber,
  calculateReturnPercentage,
  calculateCAGR,
  calculateWeightedReturn,
  calculateAssetAllocation,
  calculateSavingsRate,
  calculateNetWorth,
  calculateVolatility,
  calculateFutureValue,
  calculateTimeToGoal,
};
