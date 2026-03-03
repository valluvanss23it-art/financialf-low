import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export function LumpsumCalculator() {
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const result = useMemo(() => {
    const r = expectedReturn / 100;
    const futureValue = investmentAmount * Math.pow(1 + r, timePeriod);
    const totalReturns = futureValue - investmentAmount;

    return {
      investedAmount: investmentAmount,
      futureValue: Math.round(futureValue),
      totalReturns: Math.round(totalReturns),
    };
  }, [investmentAmount, expectedReturn, timePeriod]);

  const chartData = [
    { name: 'Invested', value: result.investedAmount, color: 'hsl(var(--primary))' },
    { name: 'Returns', value: result.totalReturns, color: 'hsl(var(--success))' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Investment Amount</Label>
              <span className="font-semibold">{formatCurrency(investmentAmount)}</span>
            </div>
            <Slider
              value={[investmentAmount]}
              onValueChange={(val) => setInvestmentAmount(val[0])}
              min={10000}
              max={10000000}
              step={10000}
            />
            <Input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              min={10000}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Expected Return (p.a.)</Label>
              <span className="font-semibold">{expectedReturn}%</span>
            </div>
            <Slider
              value={[expectedReturn]}
              onValueChange={(val) => setExpectedReturn(val[0])}
              min={1}
              max={30}
              step={0.5}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Time Period</Label>
              <span className="font-semibold">{timePeriod} years</span>
            </div>
            <Slider
              value={[timePeriod]}
              onValueChange={(val) => setTimePeriod(val[0])}
              min={1}
              max={40}
              step={1}
            />
          </div>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center p-4 rounded-lg bg-primary/10">
          <p className="text-sm text-muted-foreground">Invested Amount</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(result.investedAmount)}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-success/10">
          <p className="text-sm text-muted-foreground">Estimated Returns</p>
          <p className="text-xl font-bold text-success">{formatCurrency(result.totalReturns)}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-secondary/10">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-xl font-bold text-secondary">{formatCurrency(result.futureValue)}</p>
        </div>
      </div>
    </div>
  );
}
