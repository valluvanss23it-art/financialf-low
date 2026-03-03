import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  const result = useMemo(() => {
    const p = loanAmount;
    const r = interestRate / 100 / 12;
    const n = loanTenure * 12;

    const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    // Generate amortization data for chart
    const chartData = [];
    let balance = p;
    for (let year = 0; year <= loanTenure; year++) {
      chartData.push({
        year: `Y${year}`,
        principal: Math.round(p - balance),
        interest: Math.round(year * 12 * emi - (p - balance)),
        balance: Math.round(balance),
      });
      const yearlyPayments = Math.min(12, n - year * 12);
      for (let m = 0; m < yearlyPayments; m++) {
        const interestPayment = balance * r;
        const principalPayment = emi - interestPayment;
        balance -= principalPayment;
      }
    }

    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principal: p,
      chartData,
    };
  }, [loanAmount, interestRate, loanTenure]);

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
              <Label>Loan Amount</Label>
              <span className="font-semibold">{formatCurrency(loanAmount)}</span>
            </div>
            <Slider
              value={[loanAmount]}
              onValueChange={(val) => setLoanAmount(val[0])}
              min={100000}
              max={50000000}
              step={100000}
            />
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              min={100000}
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
              min={5}
              max={20}
              step={0.1}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Loan Tenure</Label>
              <span className="font-semibold">{loanTenure} years</span>
            </div>
            <Slider
              value={[loanTenure]}
              onValueChange={(val) => setLoanTenure(val[0])}
              min={1}
              max={30}
              step={1}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Monthly EMI</p>
            <p className="text-4xl font-bold gradient-text">{formatCurrency(result.emi)}</p>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={result.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="year"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Area
              type="monotone"
              dataKey="principal"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="interest"
              stackId="1"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center p-4 rounded-lg bg-primary/10">
          <p className="text-sm text-muted-foreground">Principal Amount</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(result.principal)}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-destructive/10">
          <p className="text-sm text-muted-foreground">Total Interest</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(result.totalInterest)}</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-secondary/10">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold text-secondary">{formatCurrency(result.totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}
