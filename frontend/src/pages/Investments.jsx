import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Plus, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { investmentsAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetForm } from '@/components/assets/AssetForm';
import { InvestmentForm } from '@/components/assets/InvestmentForm';
import { PortfolioSummary } from '@/components/investments/PortfolioSummary';
import { InvestmentList } from '@/components/investments/InvestmentList';
import { PortfolioAllocationChart } from '@/components/investments/PortfolioAllocationChart';
import { ReturnsAnalysisChart } from '@/components/investments/ReturnsAnalysisChart';
import { TopPerformers } from '@/components/investments/TopPerformers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Asset = any;

// Investment types only (excluding cash, bank, property)
const investmentTypes: Asset['type'][] = ['stocks', 'mutual_funds', 'crypto', 'gold', 'fd', 'other'];

export default function InvestmentsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchAssets = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await investmentsAPI.getAll();
      setAssets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      setAssets([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
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

  const filteredAssets = filterType === 'all' 
    ? assets 
    : assets.filter(a => a.type === filterType);

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Investments"
          description="Track your investment portfolio and analyze returns"
          icon={<TrendingUp className="w-6 h-6" />}
        />

        <div className="mb-8">
          <InfoCard title="Why Track Investments?" variant="info">
            <p>
              Monitoring your investments helps you understand portfolio performance, identify 
              top performers, and make informed decisions. Track stocks, mutual funds, crypto, 
              gold, and other investments with detailed returns analysis.
            </p>
          </InfoCard>
        </div>

        {/* Portfolio Summary */}
        <div className="mb-8">
          <PortfolioSummary assets={assets} loading={isLoading} />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Investments</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
                <SelectItem value="mutual_funds">Mutual Funds</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="fd">Fixed Deposits</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
              </DialogHeader>
              <InvestmentForm
                useInvestmentsAPI={true}
                onSuccess={() => {
                  fetchAssets();
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioAllocationChart assets={filteredAssets} loading={isLoading} />
              <ReturnsAnalysisChart assets={filteredAssets} loading={isLoading} />
            </div>

            {/* Top Performers */}
            <TopPerformers assets={assets} loading={isLoading} />
          </TabsContent>

          <TabsContent value="holdings">
            <div className="finance-card">
              <h2 className="text-xl font-semibold mb-6">Your Investments</h2>
              <InvestmentList
                assets={filteredAssets}
                isLoading={isLoading}
                onRefresh={fetchAssets}
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="💡 Understanding CAGR" variant="tip">
                CAGR (Compound Annual Growth Rate) shows the annualized return of your 
                investment, accounting for compounding. A 12% CAGR means your investment 
                grew by 12% per year on average.
              </InfoCard>
              <InfoCard title="📊 Absolute vs Relative Returns" variant="info">
                Absolute returns show total gain/loss in rupees, while relative returns 
                show percentage change. Both are important for evaluating performance.
              </InfoCard>
            </div>

            <ReturnsAnalysisChart assets={assets} loading={isLoading} />
            <TopPerformers assets={assets} loading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
