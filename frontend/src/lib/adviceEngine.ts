export type RiskTolerance = "Low" | "Medium" | "High";

interface ExpenseCategory {
  name: string;
  amount: number;
}

interface AdviceInput {
  age: number;
  monthlyIncome: number;
  monthlySavings: number;
  monthlyExpenses: ExpenseCategory[];
  existingInvestments: number;
  riskTolerance: RiskTolerance;
  expenseHistory: Array<{ month: string; total: number }>;
  incomeStability: "Low" | "Medium" | "High";
  market?: { goldPrice?: number; stockIndex?: number; mutualFundNAV?: number };
}

interface AllocationAdvice {
  equity: number;
  debt: number;
  gold: number;
  mutualFunds: number;
}

interface SpendingAdvice {
  topOverspends: Array<{ name: string; amount: string }>;
  trend?: {
    direction: "up" | "down";
    changePct: number;
  };
}

interface PersonalizedAdvice {
  allocation: AllocationAdvice;
  spending: SpendingAdvice;
  actions: string[];
}

export function generateAdvice(input: AdviceInput): PersonalizedAdvice {
  // Determine allocation based on risk tolerance
  let allocation: AllocationAdvice;

  if (input.riskTolerance === "Low") {
    allocation = { equity: 30, debt: 50, gold: 15, mutualFunds: 5 };
  } else if (input.riskTolerance === "High") {
    allocation = { equity: 60, debt: 20, gold: 10, mutualFunds: 10 };
  } else {
    // Medium (default)
    allocation = { equity: 45, debt: 35, gold: 12, mutualFunds: 8 };
  }

  // Calculate spending advice
  const topOverspends = input.monthlyExpenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((e) => ({
      name: e.name,
      amount: `₹${e.amount.toLocaleString()}`,
    }));

  // Calculate trend
  let trend;
  if (input.expenseHistory && input.expenseHistory.length >= 2) {
    const current =
      input.expenseHistory[input.expenseHistory.length - 1]?.total || 0;
    const previous =
      input.expenseHistory[input.expenseHistory.length - 2]?.total || 0;
    const changePct =
      previous > 0 ? ((current - previous) / previous) * 100 : 0;
    trend = {
      direction: changePct > 0 ? ("up" as const) : ("down" as const),
      changePct: Math.round(Math.abs(changePct)),
    };
  }

  // Generate actionable advice
  const actions: string[] = [];

  const savingsRate =
    input.monthlyIncome > 0
      ? (input.monthlySavings / input.monthlyIncome) * 100
      : 0;

  if (savingsRate < 20) {
    actions.push("Increase savings target to 20-30% of income");
  }

  if (input.existingInvestments === 0 && input.monthlySavings > 0) {
    actions.push(
      input.riskTolerance === "Low"
        ? "Start with conservative investments like bonds or PPF"
        : "Begin a diversified investment portfolio"
    );
  }

  if (topOverspends.length > 0) {
    actions.push(`Review and optimize ${topOverspends[0]?.name} spending`);
  }

  if (input.incomeStability === "Low") {
    actions.push("Build emergency fund for 6-12 months of expenses");
  }

  if (input.age < 35) {
    actions.push("Leverage tax-advantaged investments like equity mutual funds");
  }

  if (actions.length === 0) {
    actions.push("Maintain current financial discipline");
    actions.push("Review portfolio quarterly");
  }

  return {
    allocation,
    spending: {
      topOverspends,
      trend,
    },
    actions,
  };
}
