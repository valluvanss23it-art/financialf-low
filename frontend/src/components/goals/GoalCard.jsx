import { useState } from 'react';
import { goalsAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Target, Calendar, Trash2, Plus, Check, TrendingUp, Pencil, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { GoalEditDialog } from './GoalEditDialog';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  priority: string;
  notes: string | null;
  is_completed: boolean;
  created_at: string;
  recurring_amount?: number;
  recurring_frequency?: string;
  last_contribution_date?: string | null;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = goal.target_amount - goal.current_amount;
  const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

  const priorityColors: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-muted text-muted-foreground'
  };

  const handleAddSavings = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const newAmount = goal.current_amount + amount;
      const isCompleted = newAmount >= goal.target_amount;

      await goalsAPI.update(goal.id, { 
        current_amount: newAmount,
        is_completed: isCompleted
      });

      toast.success(isCompleted ? '🎉 Goal completed!' : 'Savings added!');
      setAddAmount('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this goal?')) return;

    try {
      await goalsAPI.delete(goal.id);
      toast.success('Goal deleted');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleMarkComplete = async () => {
    try {
      await goalsAPI.update(goal.id, { 
        is_completed: !goal.is_completed,
        current_amount: goal.is_completed ? goal.current_amount : goal.target_amount
      });
      toast.success(goal.is_completed ? 'Goal reopened' : 'Goal marked complete!');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  return (
    <>
      <Card className={`transition-all ${goal.is_completed ? 'opacity-75 bg-muted/50' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className={`h-5 w-5 ${goal.is_completed ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className={`font-semibold ${goal.is_completed ? 'line-through' : ''}`}>{goal.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className={priorityColors[goal.priority]}>
                {goal.priority}
              </Badge>
              <Badge variant="secondary">{goal.category}</Badge>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm mt-1">
              <span>₹{goal.current_amount.toLocaleString('en-IN')}</span>
              <span className="text-muted-foreground">₹{goal.target_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
            {goal.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
                {daysLeft !== null && daysLeft > 0 && (
                  <span className="text-xs">({daysLeft} days left)</span>
                )}
              </div>
            )}
            {remaining > 0 && !goal.is_completed && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>₹{remaining.toLocaleString('en-IN')} to go</span>
              </div>
            )}
            {goal.recurring_frequency && goal.recurring_frequency !== 'none' && goal.recurring_amount && goal.recurring_amount > 0 && (
              <div className="flex items-center gap-1 text-primary">
                <RefreshCw className="h-4 w-4" />
                <span>₹{goal.recurring_amount.toLocaleString('en-IN')}/{goal.recurring_frequency}</span>
              </div>
            )}
          </div>

          {goal.notes && (
            <p className="text-sm text-muted-foreground mb-4 italic">{goal.notes}</p>
          )}

          {!goal.is_completed && (
            <div className="flex gap-2 mb-3">
              <Input
                type="number"
                placeholder="Add savings"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="flex-1"
                min="1"
              />
              <Button size="sm" onClick={handleAddSavings} disabled={loading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={handleMarkComplete}>
                <Check className="h-4 w-4 mr-1" />
                {goal.is_completed ? 'Reopen' : 'Complete'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <GoalEditDialog
        goal={goal}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}
