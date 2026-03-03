import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { insuranceAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { InsuranceForm } from '@/components/insurance/InsuranceForm';
import { InsuranceList } from '@/components/insurance/InsuranceList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Insurance = any;

export default function InsurancePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Insurance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchPolicies = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await insuranceAPI.getAll();
      setPolicies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching insurance policies:', error);
      setPolicies([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchPolicies();
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

  const activePolicies = policies.filter(p => p.is_active);
  const totalCoverage = activePolicies.reduce((sum, p) => sum + Number(p.coverage_amount), 0);
  const yearlyPremium = activePolicies.reduce((sum, p) => {
    const premium = Number(p.premium_amount);
    switch (p.premium_frequency) {
      case 'monthly': return sum + premium * 12;
      case 'quarterly': return sum + premium * 4;
      case 'half-yearly': return sum + premium * 2;
      default: return sum + premium;
    }
  }, 0);

  const upcomingRenewals = activePolicies.filter(p => {
    if (!p.next_premium_date) return false;
    const nextDate = new Date(p.next_premium_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return nextDate <= thirtyDaysFromNow;
  }).length;

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Insurance"
          description="Manage your insurance policies and coverage"
          icon={<Shield className="w-6 h-6" />}
        />

        <div className="mb-8">
          <InfoCard title="Why Insurance Matters?" variant="info">
            <p>
              Insurance provides financial protection against unexpected events. Health insurance
              covers medical expenses, life insurance protects your family, vehicle insurance
              covers accidents, and property insurance protects your assets.
            </p>
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Coverage"
            value={totalCoverage}
            icon={<Shield className="w-5 h-5" />}
            variant="income"
          />
          <StatCard
            title="Yearly Premium"
            value={yearlyPremium}
            icon={<Shield className="w-5 h-5" />}
            variant="expense"
          />
          <StatCard
            title="Active Policies"
            value={activePolicies.length}
            icon={<Shield className="w-5 h-5" />}
            variant="savings"
            subtitle="policies active"
          />
          <StatCard
            title="Upcoming Renewals"
            value={upcomingRenewals}
            icon={<Shield className="w-5 h-5" />}
            variant={upcomingRenewals > 0 ? 'expense' : 'neutral'}
            subtitle="in next 30 days"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Insurance Policy</DialogTitle>
              </DialogHeader>
              <InsuranceForm
                onSuccess={() => {
                  fetchPolicies();
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <InfoCard title="💡 Coverage Guidelines" variant="tip">
            Health insurance should cover at least 10x your annual income. Life insurance
            coverage should be 10-15x your annual income to adequately protect your family.
          </InfoCard>
          <InfoCard title="⚠️ Review Annually" variant="warning">
            Review your insurance coverage annually and update it based on life changes
            like marriage, having children, or buying a new home.
          </InfoCard>
        </div>

        <div className="finance-card">
          <h2 className="text-xl font-semibold mb-6">Your Policies</h2>
          <InsuranceList
            policies={policies}
            isLoading={isLoading}
            onRefresh={fetchPolicies}
          />
        </div>
      </div>
    </Layout>
  );
}
