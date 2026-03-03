import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, CreditCard, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { expensesAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { StatCard } from '@/components/ui/stat-card';
import { ExpenseForm } from '@/components/expense/ExpenseForm';
import { ExpenseList } from '@/components/expense/ExpenseList';
import { ExpenseCategoryChart } from '@/components/expense/ExpenseCategoryChart';
import { ExpenseMonthlyChart } from '@/components/expense/ExpenseMonthlyChart';

type Expense = any;

export default function ExpensePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchExpenses = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await expensesAPI.getAll();
      setExpenses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
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

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const thisMonthExpense = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  const avgDailyExpense = thisMonthExpense / new Date().getDate();
  const transactionCount = expenses.length;

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Expenses"
          description="Track and analyze your spending habits"
          icon={<TrendingDown className="w-6 h-6" />}
        />

        {/* What is Expense Section */}
        <div className="mb-8">
          <InfoCard title="What are Expenses?" variant="info">
            <p>
              Expenses are the costs you incur in your daily life, from essentials
              like food and rent to discretionary spending like entertainment.
              Tracking expenses helps you identify spending patterns and find
              opportunities to save.
            </p>
          </InfoCard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Expenses"
            value={totalExpense}
            icon={<TrendingDown className="w-5 h-5" />}
            variant="expense"
          />
          <StatCard
            title="This Month"
            value={thisMonthExpense}
            icon={<Calendar className="w-5 h-5" />}
            variant="expense"
          />
          <StatCard
            title="Daily Average"
            value={Math.round(avgDailyExpense)}
            icon={<BarChart3 className="w-5 h-5" />}
            variant="neutral"
            subtitle="this month"
          />
          <StatCard
            title="Transactions"
            value={transactionCount}
            icon={<CreditCard className="w-5 h-5" />}
            variant="neutral"
            subtitle="total entries"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ExpenseCategoryChart expenses={expenses} />
          <ExpenseMonthlyChart expenses={expenses} />
        </div>

        {/* Add Expense Form */}
        <div className="finance-card mb-8">
          <h2 className="text-xl font-semibold mb-6">Add New Expense</h2>
          <ExpenseForm onSuccess={fetchExpenses} />
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <InfoCard title="💡 50/30/20 Rule" variant="tip">
            Allocate 50% of income to needs, 30% to wants, and 20% to savings.
            This simple budgeting framework helps maintain financial balance.
          </InfoCard>
          <InfoCard title="⚠️ Watch Out" variant="warning">
            Small daily expenses like coffee and snacks can add up quickly.
            Track these "latte factor" expenses to find hidden savings.
          </InfoCard>
        </div>

        {/* Expense List */}
        <div className="finance-card">
          <h2 className="text-xl font-semibold mb-6">Expense History</h2>
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            onRefresh={fetchExpenses}
          />
        </div>
      </div>
    </Layout>
  );
}
