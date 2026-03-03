import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
  Building2,
  CreditCard,
  Wallet,
  Shield,
  Target,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { InvestmentAllocationChart } from "@/components/charts/InvestmentAllocationChart";
import { GoalsSummary } from "@/components/dashboard/GoalsSummary";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdvisorPanel from "@/components/dashboard/AdvisorPanel";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { stats, monthlyData, netWorthData, assetAllocation, goals, loading } = useDashboardData();

  const isLoading = authLoading || loading;

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Dashboard"
          description="Your complete financial overview at a glance"
          icon={<LineChart className="w-6 h-6" />}
        />

        <div className="mb-8 animate-slide-up">
          <AdvisorPanel />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-slide-up">
          <QuickActions />
        </div>

        {!user && !authLoading && (
          <div className="mb-8 p-6 rounded-xl border border-border bg-card text-center">
            <h3 className="text-lg font-semibold mb-2">Welcome to FinanceFlow</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to track your finances and see your personalized dashboard
            </p>
            <Button asChild>
              <Link to="/auth">Sign In to Get Started</Link>
            </Button>
          </div>
        )}

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Income"
            value={stats.totalIncome}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="income"
            subtitle="This month"
          />
          <StatCard
            title="Total Expense"
            value={stats.totalExpense}
            icon={<TrendingDown className="w-5 h-5" />}
            variant="expense"
            subtitle="This month"
          />
          <StatCard
            title="Savings"
            value={stats.savings}
            icon={<PiggyBank className="w-5 h-5" />}
            variant="savings"
            subtitle="This month"
          />
          <StatCard
            title="Investments"
            value={stats.investments}
            icon={<LineChart className="w-5 h-5" />}
            variant="investment"
            subtitle="Total value"
          />
          <StatCard
            title="Net Worth"
            value={stats.netWorth}
            icon={<Wallet className="w-5 h-5" />}
            variant="savings"
            subtitle="Assets - Liabilities"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Assets"
            value={stats.assets}
            icon={<Building2 className="w-5 h-5" />}
            variant="asset"
            subtitle="Total asset value"
          />
          <StatCard
            title="Liabilities"
            value={stats.liabilities}
            icon={<CreditCard className="w-5 h-5" />}
            variant="liability"
            subtitle="Outstanding loans"
          />
          <StatCard
            title="Insurance"
            value={stats.insuranceCoverage}
            icon={<Shield className="w-5 h-5" />}
            variant="asset"
            subtitle="Total coverage"
          />
          <StatCard
            title="Active Goals"
            value={stats.activeGoals}
            icon={<Target className="w-5 h-5" />}
            variant="neutral"
            subtitle="In progress"
            formatAsCurrency={false}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <IncomeExpenseChart data={monthlyData} loading={isLoading} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <NetWorthChart data={netWorthData} loading={isLoading} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <InvestmentAllocationChart data={assetAllocation} loading={isLoading} />
          </div>
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <GoalsSummary goals={goals} loading={isLoading} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
