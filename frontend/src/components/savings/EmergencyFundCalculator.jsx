import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function EmergencyFundCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(30000);
  const [months, setMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(50000);

  const targetFund = monthlyExpenses * months;
  const progress = Math.min((currentSavings / targetFund) * 100, 100);
  const remaining = Math.max(targetFund - currentSavings, 0);
  const isHealthy = progress >= 100;
  const isAtRisk = progress < 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Emergency Fund Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Monthly Expenses: ₹{monthlyExpenses.toLocaleString('en-IN')}</Label>
            <Slider
              value={[monthlyExpenses]}
              onValueChange={([v]) => setMonthlyExpenses(v)}
              min={10000}
              max={200000}
              step={5000}
            />
          </div>

          <div className="space-y-2">
            <Label>Months of Coverage: {months}</Label>
            <Slider
              value={[months]}
              onValueChange={([v]) => setMonths(v)}
              min={3}
              max={12}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current">Current Emergency Savings (₹)</Label>
            <Input
              id="current"
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
              min={0}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Target Fund</span>
            <span className="font-bold text-lg">₹{targetFund.toLocaleString('en-IN')}</span>
          </div>
          
          <Progress value={progress} className="h-3" />
          
          <div className="flex justify-between text-sm">
            <span>₹{currentSavings.toLocaleString('en-IN')} saved</span>
            <span>{progress.toFixed(0)}% complete</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          isHealthy ? 'bg-primary/10 text-primary' : 
          isAtRisk ? 'bg-destructive/10 text-destructive' : 
          'bg-warning/10 text-warning'
        }`}>
          {isHealthy ? (
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 mt-0.5" />
          )}
          <div>
            <h4 className="font-semibold">
              {isHealthy ? 'Excellent! Your emergency fund is healthy' : 
               isAtRisk ? 'Your emergency fund needs attention' : 
               'You\'re making good progress'}
            </h4>
            <p className="text-sm opacity-80">
              {isHealthy 
                ? `You have ${months}+ months of expenses covered. Great job!`
                : `You need ₹${remaining.toLocaleString('en-IN')} more for ${months} months of coverage.`
              }
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Monthly Target</p>
            <p className="font-semibold">₹{Math.ceil(remaining / 12).toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground">to reach goal in 1 year</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground">Months Covered</p>
            <p className="font-semibold">{(currentSavings / monthlyExpenses).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">with current savings</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
