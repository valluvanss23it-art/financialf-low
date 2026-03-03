import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { liabilitiesAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { LiabilityForm } from '@/components/liabilities/LiabilityForm';
import { LiabilityList } from '@/components/liabilities/LiabilityList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Liability = any;

export default function LiabilitiesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchLiabilities = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await liabilitiesAPI.getAll();
      setLiabilities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      setLiabilities([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchLiabilities();
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

  const activeLiabilities = liabilities.filter(l => !l.is_paid_off);
  const totalOutstanding = activeLiabilities.reduce((sum, l) => sum + Number(l.outstanding_balance), 0);
  const totalEMI = activeLiabilities.reduce((sum, l) => sum + Number(l.emi_amount), 0);
  const avgInterestRate = activeLiabilities.length > 0
    ? activeLiabilities.reduce((sum, l) => sum + Number(l.interest_rate), 0) / activeLiabilities.length
    : 0;

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Liabilities"
          description="Track and manage all your loans and debts"
          icon={<CreditCard className="w-6 h-6" />}
        />

        <div className="mb-8">
          <InfoCard title="What are Liabilities?" variant="info">
            <p>
              Liabilities are debts or financial obligations you owe. This includes home loans,
              car loans, personal loans, education loans, and credit card debt. Managing liabilities
              effectively is crucial for financial health and building wealth.
            </p>
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Outstanding"
            value={totalOutstanding}
            icon={<CreditCard className="w-5 h-5" />}
            variant="expense"
          />
          <StatCard
            title="Monthly EMI"
            value={totalEMI}
            icon={<CreditCard className="w-5 h-5" />}
            variant="expense"
          />
          <StatCard
            title="Avg Interest Rate"
            value={avgInterestRate.toFixed(2) + '%'}
            icon={<CreditCard className="w-5 h-5" />}
            variant="neutral"
            subtitle="across all loans"
          />
          <StatCard
            title="Active Loans"
            value={activeLiabilities.length}
            icon={<CreditCard className="w-5 h-5" />}
            variant="savings"
            subtitle="loans being repaid"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Loan</DialogTitle>
              </DialogHeader>
              <LiabilityForm
                onSuccess={() => {
                  fetchLiabilities();
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <InfoCard title="💡 Tip: Pay High-Interest First" variant="tip">
            Focus on paying off high-interest debt first (like credit cards) while making
            minimum payments on lower-interest loans. This saves you money in the long run.
          </InfoCard>
          <InfoCard title="⚠️ Keep EMI Under 40%" variant="warning">
            Your total EMI payments should ideally be less than 40% of your monthly income
            to maintain a healthy debt-to-income ratio.
          </InfoCard>
        </div>

        <div className="finance-card">
          <h2 className="text-xl font-semibold mb-6">Your Loans</h2>
          <LiabilityList
            liabilities={liabilities}
            isLoading={isLoading}
            onRefresh={fetchLiabilities}
          />
        </div>
      </div>
    </Layout>
  );
}
