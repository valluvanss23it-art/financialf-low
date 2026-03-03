import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { goalsAPI } from '@/lib/api';
import { StatCard } from '@/components/ui/stat-card';
import { Target, TrendingUp, CheckCircle2, Wallet } from 'lucide-react';

interface GoalsStatsProps {
  refreshTrigger: number;
}

export function GoalsStats({ refreshTrigger }: GoalsStatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalSaved: 0,
    totalTarget: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const response = await goalsAPI.getAll();
        const goals = response.data.data || [];
        
        setStats({
          totalGoals: goals.length,
          activeGoals: goals.filter(g => !g.is_completed).length,
          completedGoals: goals.filter(g => g.is_completed).length,
          totalSaved: goals.reduce((sum, g) => sum + Number(g.current_amount), 0),
          totalTarget: goals.reduce((sum, g) => sum + Number(g.target_amount), 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user, refreshTrigger]);

  const overallProgress = stats.totalTarget > 0 
    ? ((stats.totalSaved / stats.totalTarget) * 100).toFixed(0) 
    : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Goals"
        value={stats.totalGoals}
        icon={<Target className="h-5 w-5" />}
        subtitle="All your financial goals"
      />
      <StatCard
        title="Active Goals"
        value={stats.activeGoals}
        icon={<TrendingUp className="h-5 w-5" />}
        subtitle="Goals in progress"
      />
      <StatCard
        title="Completed"
        value={stats.completedGoals}
        icon={<CheckCircle2 className="h-5 w-5" />}
        subtitle="Goals achieved"
      />
      <StatCard
        title="Total Saved"
        value={`₹${stats.totalSaved.toLocaleString('en-IN')}`}
        icon={<Wallet className="h-5 w-5" />}
        subtitle={`${overallProgress}% of total target`}
      />
    </div>
  );
}
