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

export function FDCalculator() {
  const [depositAmount, setDepositAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [timePeriod, setTimePeriod] = useState(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState(4); // Quarterly

  const result = useMemo(() => {
    const p = depositAmount;
    const r = interestRate / 100;
    const n = compoundingFrequency;
    const t = timePeriod;

    const maturityAmount = p * Math.pow(1 + r / n, n * t);
    const totalInterest = maturityAmount - p;

    return {
      principal: p,
      maturityAmount: Math.round(maturityAmount),
      totalInterest: Math.round(totalInterest),
    };
  }, [depositAmount, interestRate, timePeriod, compoundingFrequency]);

  const chartData = [
    { name: 'Principal', value: result.principal, color: 'hsl(var(--primary))' },
    { name: 'Interest', value: result.totalInterest, color: 'hsl(var(--success))' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const compoundingOptions = [
    { value: 1, label: 'Yearly' },
    { value: 2, label: 'Half-Yearly' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Deposit Amount</Label>
              <span className="font-semibold">{formatCurrency(depositAmount)}</span>
            </div>
            <Slider
              value={[depositAmount]}
              onValueChange={(val) => setDepositAmount(val[0])}
              min={10000}
              max={10000000}
              step={10000}
            />
            <Input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              min={10000}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Interest Rate (p.a.)</Label>
              <span className="font-semibold">{interestRate}%</span>
            </div>
            <Slider
              value={[interestRate]}
              onValueChange={(val) => setInterestRate(val[0])}
              min={3}
              max={12}
              step={0.1}
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
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Compounding Frequency</Label>
            <div className="grid grid-cols-2 gap-2">
              {compoundingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCompoundingFrequency(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    compoundingFrequency === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
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
          <p className="text-sm text-muted-foreground">Principal Amount</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(result.principal)}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-success/10">
          <p className="text-sm text-muted-foreground">Total Interest</p>
          <p className="text-xl font-bold text-success">{formatCurrency(result.totalInterest)}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-secondary/10">
          <p className="text-sm text-muted-foreground">Maturity Amount</p>
          <p className="text-xl font-bold text-secondary">{formatCurrency(result.maturityAmount)}</p>
        </div>
      </div>
    </div>
  );
}
