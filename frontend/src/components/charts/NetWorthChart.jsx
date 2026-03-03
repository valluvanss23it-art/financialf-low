import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface NetWorthData {
  month: string;
  netWorth: number;
}

interface NetWorthChartProps {
  data?: NetWorthData[];
  loading?: boolean;
}

const sampleData = [
  { month: "Jan", netWorth: 1200000 },
  { month: "Feb", netWorth: 1280000 },
  { month: "Mar", netWorth: 1350000 },
  { month: "Apr", netWorth: 1420000 },
  { month: "May", netWorth: 1510000 },
  { month: "Jun", netWorth: 1620000 },
];

export function NetWorthChart({ data, loading }: NetWorthChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData;
  const hasRealData = data && data.some(d => d.netWorth > 0);

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
        Net Worth Growth
        {!hasRealData && (
          <span className="text-xs font-normal text-muted-foreground ml-2">(Sample Data)</span>
        )}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => `₹${value / 100000}L`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [
                `₹${value.toLocaleString("en-IN")}`,
                "Net Worth",
              ]}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#netWorthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
