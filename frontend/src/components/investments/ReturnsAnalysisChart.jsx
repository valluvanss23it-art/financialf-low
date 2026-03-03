import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface Asset {
  id: string;
  name: string;
  type: string;
  current_value: number;
  purchase_value: number | null;
}

interface ReturnsAnalysisChartProps {
  assets: Asset[];
  loading?: boolean;
}

export function ReturnsAnalysisChart({ assets, loading }: ReturnsAnalysisChartProps) {
  if (loading) {
    return (
      <div className="finance-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-[280px] bg-muted rounded"></div>
      </div>
    );
  }

  const assetsWithReturns = assets
    .filter(a => a.purchase_value && Number(a.purchase_value) > 0)
    .map(asset => {
      const returnPercent = ((Number(asset.current_value) - Number(asset.purchase_value!)) / Number(asset.purchase_value!)) * 100;
      return {
        name: asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name,
        fullName: asset.name,
        returns: parseFloat(returnPercent.toFixed(2)),
        type: asset.type,
      };
    })
    .sort((a, b) => b.returns - a.returns);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (assetsWithReturns.length === 0) {
    return (
      <div className="finance-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Returns by Investment</h3>
        <div className="h-[280px] flex items-center justify-center text-muted-foreground">
          Add purchase values to see returns analysis
        </div>
      </div>
    );
  }

  return (
    <div className="finance-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Returns by Investment (%)</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={assetsWithReturns}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `${value}%`}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              width={75}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}%`, 'Return']}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
            />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
            <Bar dataKey="returns" radius={[0, 4, 4, 0]}>
              {assetsWithReturns.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.returns >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
