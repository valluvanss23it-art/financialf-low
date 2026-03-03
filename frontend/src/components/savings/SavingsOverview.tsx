import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { goalsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, Target, TrendingUp } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 
                'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export function SavingsOverview() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await goalsAPI.getAll();
        const activeGoals = (data.data || [])
          .filter((g: any) => !g.is_completed)
          .slice(0, 6);
        setGoals(activeGoals);
      } catch (error) {
        console.error('Error fetching goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const chartData = goals.map((g, i) => ({
    name: g.name,
    value: Number(g.current_amount),
    color: COLORS[i % COLORS.length]
  })).filter(d => d.value > 0);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6 h-64" />
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Sign in to view savings</h3>
          <p className="text-muted-foreground text-sm">Track your savings progress across all goals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Savings Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
            <p className="text-3xl font-bold text-primary">₹{totalSaved.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              of ₹{totalTarget.toLocaleString('en-IN')} target
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{overallProgress.toFixed(0)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          <div className="space-y-3">
            {goals.slice(0, 4).map((goal) => {
              const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{goal.name}</span>
                    <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Savings Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active savings goals</p>
                <p className="text-sm">Create goals to see distribution</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
