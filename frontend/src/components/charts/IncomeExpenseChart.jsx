import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data?: MonthlyData[];
  loading?: boolean;
}

// Default sample data for when no data is provided
const sampleData = [
  { month: "Jan", income: 85000, expense: 52000 },
  { month: "Feb", income: 88000, expense: 48000 },
  { month: "Mar", income: 92000, expense: 55000 },
  { month: "Apr", income: 95000, expense: 51000 },
  { month: "May", income: 89000, expense: 54000 },
  { month: "Jun", income: 98000, expense: 53000 },
];

export function IncomeExpenseChart({ data, loading }: IncomeExpenseChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData;
  const hasRealData = data && data.some(d => d.income > 0 || d.expense > 0);

  if (loading) {
    return (
      <div className="finance-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-[300px] bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="finance-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Income vs Expense Trend
        {!hasRealData && (
          <span className="text-xs font-normal text-muted-foreground ml-2">(Sample Data)</span>
        )}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString("en-IN")}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "hsl(var(--foreground))" }}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
              )}
            />
            <Bar
              dataKey="income"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
