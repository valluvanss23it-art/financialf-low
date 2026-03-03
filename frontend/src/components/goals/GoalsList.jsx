import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { goalsAPI } from '@/lib/api';
import { GoalCard } from './GoalCard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Filter } from 'lucide-react';

type Goal = any;

interface GoalsListProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export function GoalsList({ refreshTrigger, onRefresh }: GoalsListProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const response = await goalsAPI.getAll();
      let goals = response.data.data || [];
      
      if (filter === 'active') {
        goals = goals.filter(g => !g.is_completed);
      } else if (filter === 'completed') {
        goals = goals.filter(g => g.is_completed);
      }
      
      setGoals(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user, refreshTrigger, filter]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5 h-48" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Your Goals ({goals.length})
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v: 'all' | 'active' | 'completed') => setFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground">Create your first financial goal to start tracking!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onUpdate={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
