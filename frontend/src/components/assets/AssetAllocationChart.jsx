import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Asset {
  type: string;
  current_value: number;
}

interface AssetAllocationChartProps {
  assets: Asset[];
}

const typeLabels: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank',
  fd: 'FD',
  stocks: 'Stocks',
  mutual_funds: 'Mutual Funds',
  crypto: 'Crypto',
  gold: 'Gold',
  property: 'Property',
  other: 'Other',
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(142, 76%, 36%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 94%, 50%)',
  'hsl(45, 93%, 47%)',
  'hsl(173, 58%, 39%)',
  'hsl(var(--muted-foreground))',
];

export function AssetAllocationChart({ assets }: AssetAllocationChartProps) {
  const allocationData = assets.reduce((acc, asset) => {
    const type = asset.type;
    const existing = acc.find(item => item.type === type);
    if (existing) {
      existing.value += Number(asset.current_value);
    } else {
      acc.push({ type, name: typeLabels[type] || type, value: Number(asset.current_value) });
    }
    return acc;
  }, [] as { type: string; name: string; value: number }[]);

  const total = allocationData.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = allocationData.map((item, index) => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(1),
    color: COLORS[index % COLORS.length],
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="finance-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Asset Allocation</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {dataWithPercent.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatCurrency(value)]}
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
