/**
 * Frontend Financial Calculation Utilities
 */

import { safeParseNumber, roundNumber } from './utils';

/**
 * Calculate portfolio returns percentage
 */
export function calculateReturnPercentage(
  currentValue: number | string,
  investedAmount: number | string
): number {
  const current = safeParseNumber(currentValue, 0);
  const invested = safeParseNumber(investedAmount, 0);

  if (invested <= 0) {
    return 0;
  }

  return roundNumber((current - invested) / invested * 100, 2);
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 */
export function calculateCAGR(
  beginningValue: number | string,
  endingValue: number | string,
  years: number | string
): number {
  const beginning = safeParseNumber(beginningValue, 0);
  const ending = safeParseNumber(endingValue, 0);
  const yearsValue = safeParseNumber(years, 1);

  if (beginning <= 0 || ending < 0 || yearsValue <= 0) {
    return 0;
  }

  try {
    const ratio = Math.max(0, ending / beginning);
    const cagr = Math.pow(ratio, 1 / yearsValue) - 1;
    const cagrPercent = cagr * 100;

    if (!isFinite(cagrPercent)) {
      return 0;
    }

    return roundNumber(cagrPercent, 2);
  } catch (error) {
    console.error('Error calculating CAGR:', error);
    return 0;
  }
}

/**
 * Calculate weighted average return
 */
export function calculateWeightedReturn(
  investments: Array<{ amount: number | string; currentValue: number | string }>
): number {
  if (!Array.isArray(investments) || investments.length === 0) {
    return 0;
  }

  let totalAmount = 0;
  let totalWeightedReturn = 0;

  for (const inv of investments) {
    const amount = safeParseNumber(inv.amount, 0);
    const currentValue = safeParseNumber(inv.currentValue, amount);

    if (amount > 0) {
      const returnPercent = calculateReturnPercentage(currentValue, amount);
      totalWeightedReturn += returnPercent * amount;
      totalAmount += amount;
    }
  }

  if (totalAmount <= 0) {
    return 0;
  }

  return roundNumber(totalWeightedReturn / totalAmount, 2);
}

/**
 * Calculate asset allocation
 */
export function calculateAssetAllocation(
  assets: Array<{ name: string; value: number | string }>
) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return {
      total: 0,
      allocation: [],
      herfindahlIndex: 0,
    };
  }

  const validAssets = assets
    .map((a) => ({
      ...a,
      value: safeParseNumber(a.value, 0),
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

  const allocation = validAssets.map((a) => ({
    name: a.name || 'Unknown',
    value: roundNumber(a.value, 2),
    percentage: roundNumber((a.value / total) * 100, 2),
  }));

  const herfindahlIndex = allocation.reduce((sum, a) => {
    const percent = a.percentage / 100;
    return sum + percent * percent;
  }, 0);

  return {
    total: roundNumber(total, 2),
    allocation,
    herfindahlIndex: roundNumber(herfindahlIndex, 4),
  };
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(
  income: number | string,
  expenses: number | string
): number {
  const incomeValue = safeParseNumber(income, 0);
  const expensesValue = safeParseNumber(expenses, 0);

  if (incomeValue <= 0) {
    return 0;
  }

  const savingsRate = ((incomeValue - expensesValue) / incomeValue) * 100;
  return Math.max(0, Math.min(100, roundNumber(savingsRate, 2)));
}

/**
 * Calculate net worth
 */
export function calculateNetWorth(
  assets: Array<{ currentValue: number | string }> = [],
  liabilities: Array<{ outstandingBalance: number | string }> = [],
  investments: Array<{ currentValue: number | string; amount: number | string }> = []
): number {
  const totalAssets = assets.reduce((sum, a) => sum + safeParseNumber(a.currentValue, 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + safeParseNumber(l.outstandingBalance, 0), 0);
  const totalInvestments = investments.reduce((sum, i) => sum + safeParseNumber(i.currentValue || i.amount, 0), 0);

  return roundNumber(totalAssets + totalInvestments - totalLiabilities, 2);
}

/**
 * Calculate volatility (standard deviation)
 */
export function calculateVolatility(monthlyReturns: (number | string)[]): number {
  if (!Array.isArray(monthlyReturns) || monthlyReturns.length < 2) {
    return 0;
  }

  const validReturns = monthlyReturns
    .map((r) => safeParseNumber(r, 0))
    .filter((r) => isFinite(r));

  if (validReturns.length < 2) {
    return 0;
  }

  const mean = validReturns.reduce((a, b) => a + b, 0) / validReturns.length;
  const squaredDiff = validReturns.map((r) => Math.pow(r - mean, 2));
  const variance = squaredDiff.reduce((a, b) => a + b, 0) / validReturns.length;
  const stdDev = Math.sqrt(variance);

  // Annualize the volatility
  const annualizedVolatility = stdDev * Math.sqrt(12);
  return roundNumber(annualizedVolatility, 2);
}

/**
 * Calculate future value
 */
export function calculateFutureValue(
  presentValue: number | string,
  annualRate: number | string,
  years: number | string
): number {
  const pv = safeParseNumber(presentValue, 0);
  const rate = safeParseNumber(annualRate, 0) / 100;
  const yearsValue = safeParseNumber(years, 1);

  if (pv <= 0) {
    return 0;
  }

  try {
    const fv = pv * Math.pow(1 + rate, yearsValue);
    return roundNumber(fv, 2);
  } catch (error) {
    console.error('Error calculating future value:', error);
    return 0;
  }
}

/**
 * Calculate time to goal
 */
export function calculateTimeToGoal(
  currentAmount: number | string,
  goalAmount: number | string,
  annualRate: number | string
): number {
  const current = safeParseNumber(currentAmount, 0);
  const goal = safeParseNumber(goalAmount, 0);
  const rate = safeParseNumber(annualRate, 0) / 100;

  if (current <= 0 || goal <= 0 || goal <= current || rate <= 0) {
    return 0;
  }

  try {
    const years = Math.log(goal / current) / Math.log(1 + rate);
    return Math.max(0, roundNumber(years, 2));
  } catch (error) {
    console.error('Error calculating time to goal:', error);
    return 0;
  }
}
