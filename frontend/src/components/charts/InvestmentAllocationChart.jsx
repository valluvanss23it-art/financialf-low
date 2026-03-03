import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface InvestmentAllocationChartProps {
  data?: AllocationData[];
  loading?: boolean;
}

const sampleData = [
  { name: "Equity", value: 45, color: "hsl(var(--primary))" },
  { name: "Debt", value: 25, color: "hsl(var(--secondary))" },
  { name: "Gold", value: 15, color: "hsl(var(--accent))" },
  { name: "Real Estate", value: 10, color: "hsl(var(--info))" },
  { name: "Cash", value: 5, color: "hsl(var(--muted-foreground))" },
];

export function InvestmentAllocationChart({ data, loading }: InvestmentAllocationChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData;
  const hasRealData = data && data.length > 0 && data[0].name !== 'No Assets';

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
        Asset Allocation
        {!hasRealData && (
          <span className="text-xs font-normal text-muted-foreground ml-2">(Sample Data)</span>
        )}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}%`]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
