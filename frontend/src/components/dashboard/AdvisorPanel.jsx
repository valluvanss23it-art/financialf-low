import { useEffect, useMemo, useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { expensesAPI } from "@/lib/api";
import { generateAdvice, RiskTolerance } from "@/lib/adviceEngine";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";

interface ExpenseItem {
  amount: number;
  category?: string;
  date?: string;
}

export function AdvisorPanel() {
  const { stats, monthlyData, loading } = useDashboardData();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("Medium");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchExpenses = async () => {
      setFetching(true);
      try {
        const res = await expensesAPI.getAll();
        if (mounted) {
          setExpenses(res.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to load expenses", err);
      } finally {
        if (mounted) setFetching(false);
      }
    };
    fetchExpenses();
    return () => {
      mounted = false;
    };
  }, []);

  const expenseCategories = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const bucket: Record<string, number> = {};

    expenses.forEach((e) => {
      const date = e.date ? new Date(e.date) : null;
      if (date && (date < monthStart || date > monthEnd)) return;
      const key = e.category || "Other";
      bucket[key] = (bucket[key] || 0) + Number(e.amount || 0);
    });

    return Object.entries(bucket)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const expenseHistory = useMemo(
    () => monthlyData.map((m) => ({ month: m.month, total: m.expense })),
    [monthlyData]
  );

  const advice = useMemo(() => {
    const income = stats.totalIncome || 0;
    const savings = Math.max(0, stats.savings || 0);
    const totalExpense = stats.totalExpense || 0;

    return generateAdvice({
      age: 30,
      monthlyIncome: income,
      monthlySavings: savings,
      monthlyExpenses:
        expenseCategories.length > 0
          ? expenseCategories
          : [{ name: "Expenses", amount: totalExpense }],
      existingInvestments: stats.investments || 0,
      riskTolerance,
      expenseHistory,
      incomeStability: "Medium",
      market: { goldPrice: 6000, stockIndex: 22000, mutualFundNAV: 42 },
    });
  }, [stats, riskTolerance, expenseCategories, expenseHistory]);

  const isLoading = loading || fetching;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Smart expense & investment advisor</p>
          <h2 className="text-xl font-semibold">Personalized Plan</h2>
        </div>
        <div className="flex items-center gap-2">
          {["Low", "Medium", "High"].map((level) => (
            <Button
              key={level}
              size="sm"
              variant={riskTolerance === level ? "default" : "outline"}
              onClick={() => setRiskTolerance(level as RiskTolerance)}
              disabled={isLoading}
            >
              Risk: {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card space-y-3">
          <h3 className="text-sm font-semibold">Allocation plan</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Equity</span><span>{advice.allocation.equity}%</span></li>
            <li className="flex justify-between"><span>Debt</span><span>{advice.allocation.debt}%</span></li>
            <li className="flex justify-between"><span>Gold</span><span>{advice.allocation.gold}%</span></li>
            <li className="flex justify-between"><span>Mutual Funds</span><span>{advice.allocation.mutualFunds}%</span></li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Aligns to your risk level and current savings capacity.
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-card space-y-3">
          <h3 className="text-sm font-semibold">Spending focus</h3>
          {advice.spending.topOverspends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses recorded for this month yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {advice.spending.topOverspends.map((c) => (
                <li key={c.name} className="flex justify-between">
                  <span>{c.name}</span>
                  <span>{c.amount}</span>
                </li>
              ))}
            </ul>
          )}
          {advice.spending.trend && (
            <p className="text-xs text-muted-foreground">
              MoM trend: {advice.spending.trend.direction} ({advice.spending.trend.changePct}%)
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl border bg-card space-y-3">
          <h3 className="text-sm font-semibold">Actions</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {advice.actions.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, isLoading }: { label: string; value: string | number; isLoading?: boolean }) {
  return (
    <div className="p-4 rounded-xl border bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{isLoading ? "…" : value}</p>
    </div>
  );
}

export default AdvisorPanel;
