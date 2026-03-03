import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { incomeAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { StatCard } from '@/components/ui/stat-card';
import { IncomeForm } from '@/components/income/IncomeForm';
import { IncomeList } from '@/components/income/IncomeList';

type Income = any;

export default function IncomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchIncomes = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await incomeAPI.getAll();
      setIncomes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setIncomes([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchIncomes();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const thisMonthIncome = incomes
    .filter((inc) => {
      const incDate = new Date(inc.date);
      const now = new Date();
      return (
        incDate.getMonth() === now.getMonth() &&
        incDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, inc) => sum + Number(inc.amount), 0);
  const recurringCount = incomes.filter((inc) => inc.is_recurring).length;

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Income"
          description="Track and manage all your income sources"
          icon={<TrendingUp className="w-6 h-6" />}
        />

        {/* What is Income Section */}
        <div className="mb-8">
          <InfoCard title="What is Income?" variant="info">
            <p>
              Income is money received on a regular basis from employment,
              business, investments, or other sources. Tracking your income
              helps you understand your earning patterns and plan your finances
              better.
            </p>
          </InfoCard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Income"
            value={totalIncome}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="income"
          />
          <StatCard
            title="This Month"
            value={thisMonthIncome}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="income"
          />
          <StatCard
            title="Recurring Sources"
            value={recurringCount}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="savings"
            subtitle="active recurring incomes"
          />
        </div>

        {/* Add Income Form */}
        <div className="finance-card mb-8">
          <h2 className="text-xl font-semibold mb-6">Add New Income</h2>
          <IncomeForm onSuccess={fetchIncomes} />
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <InfoCard title="💡 Tip: Track All Sources" variant="tip">
            Don't forget to track all income sources including side hustles,
            interest income, dividends, and rental income for a complete picture.
          </InfoCard>
          <InfoCard title="⚠️ Common Mistake" variant="warning">
            Many people forget to account for irregular income like bonuses or
            freelance payments. Set reminders to log these when they occur.
          </InfoCard>
        </div>

        {/* Income List */}
        <div className="finance-card">
          <h2 className="text-xl font-semibold mb-6">Income History</h2>
          <IncomeList
            incomes={incomes}
            isLoading={isLoading}
            onRefresh={fetchIncomes}
          />
        </div>
      </div>
    </Layout>
  );
}
