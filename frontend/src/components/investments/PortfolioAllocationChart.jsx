import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Asset {
  id: string;
  name: string;
  type: string;
  current_value: number;
}

interface PortfolioAllocationChartProps {
  assets: Asset[];
  loading?: boolean;
}

const typeLabels: Record<string, string> = {
  stocks: 'Stocks',
  mutual_funds: 'Mutual Funds',
  crypto: 'Cryptocurrency',
  gold: 'Gold',
  fd: 'Fixed Deposit',
  other: 'Other',
};

const typeColors: Record<string, string> = {
  stocks: 'hsl(270, 60%, 55%)',
  mutual_funds: 'hsl(230, 60%, 55%)',
  crypto: 'hsl(30, 80%, 55%)',
  gold: 'hsl(45, 90%, 50%)',
  fd: 'hsl(35, 70%, 50%)',
  other: 'hsl(220, 10%, 50%)',
};

export function PortfolioAllocationChart({ assets, loading }: PortfolioAllocationChartProps) {
  if (loading) {
    return (
      <div className="finance-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-[280px] bg-muted rounded"></div>
      </div>
    );
  }

  // Group by type
  const allocationByType = assets.reduce((acc, asset) => {
    const type = asset.type;
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += Number(asset.current_value);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(allocationByType)
    .map(([type, value]) => ({
      name: typeLabels[type] || type,
      value,
      color: typeColors[type] || typeColors.other,
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="finance-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Allocation</h3>
        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
          No investments to display
        </div>
      </div>
    );
  }

  return (
    <div className="finance-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Allocation</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [
                `${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
