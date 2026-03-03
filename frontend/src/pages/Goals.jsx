import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { GoalForm } from '@/components/goals/GoalForm';
import { GoalsList } from '@/components/goals/GoalsList';
import { GoalsStats } from '@/components/goals/GoalsStats';
import { useAuth } from '@/hooks/useAuth';
import { useRecurringContributions } from '@/hooks/useRecurringContributions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Goals() {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Process recurring contributions on page load
  useRecurringContributions(handleRefresh);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Track Your Financial Goals</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to create and track your savings goals
              </p>
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <PageHeader
          title="Financial Goals"
          description="Set targets, track progress, and achieve your financial dreams"
        />

        <GoalsStats refreshTrigger={refreshTrigger} />
        <GoalForm onGoalAdded={handleRefresh} />
        <GoalsList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
      </div>
    </Layout>
  );
}
