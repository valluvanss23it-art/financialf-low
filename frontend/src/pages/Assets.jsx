import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { assetsAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { AssetForm } from '@/components/assets/AssetForm';
import { InvestmentForm } from '@/components/assets/InvestmentForm';
import { AssetList } from '@/components/assets/AssetList';
import { AssetAllocationChart } from '@/components/assets/AssetAllocationChart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

type Asset = any;

export default function AssetsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formType, setFormType] = useState<'asset' | 'investment'>('asset');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchAssets = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const response = await assetsAPI.getAll();
      setAssets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
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

  const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.current_value), 0);
  const totalPurchaseValue = assets.reduce((sum, asset) => sum + Number(asset.purchase_value || 0), 0);
  const totalGainLoss = totalAssets - totalPurchaseValue;
  const assetCount = assets.length;

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Assets"
          description="Track and manage all your assets and investments"
          icon={<Building2 className="w-6 h-6" />}
        />

        <div className="mb-8">
          <InfoCard title="What are Assets?" variant="info">
            <p>
              Assets are resources with economic value that you own. They include cash, bank accounts,
              fixed deposits, stocks, mutual funds, cryptocurrency, gold, and property. Tracking assets
              helps you understand your net worth and financial health.
            </p>
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Asset Value"
            value={totalAssets}
            icon={<Building2 className="w-5 h-5" />}
            variant="income"
          />
          <StatCard
            title="Purchase Value"
            value={totalPurchaseValue}
            icon={<Building2 className="w-5 h-5" />}
            variant="neutral"
          />
          <StatCard
            title="Total Gain/Loss"
            value={totalGainLoss}
            icon={<Building2 className="w-5 h-5" />}
            variant={totalGainLoss >= 0 ? 'income' : 'expense'}
          />
          <StatCard
            title="Total Assets"
            value={assetCount}
            icon={<Building2 className="w-5 h-5" />}
            variant="savings"
            subtitle="assets tracked"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Asset or Investment</DialogTitle>
              </DialogHeader>
              <Tabs value={formType} onValueChange={(v) => setFormType(v as 'asset' | 'investment')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="asset">Asset</TabsTrigger>
                  <TabsTrigger value="investment" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Investment
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="asset" className="mt-4">
                  <AssetForm
                    onSuccess={() => {
                      fetchAssets();
                      setIsDialogOpen(false);
                    }}
                  />
                </TabsContent>
                <TabsContent value="investment" className="mt-4">
                  <InvestmentForm
                    onSuccess={() => {
                      fetchAssets();
                      setIsDialogOpen(false);
                    }}
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {assets.length > 0 && (
          <div className="mb-8">
            <AssetAllocationChart assets={assets} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <InfoCard title="💡 Tip: Regular Updates" variant="tip">
            Update your asset values regularly, especially for investments like stocks
            and mutual funds, to maintain an accurate picture of your net worth.
          </InfoCard>
          <InfoCard title="⚠️ Diversification" variant="warning">
            Don't put all your eggs in one basket. A well-diversified portfolio helps
            reduce risk and provides more stable returns over time.
          </InfoCard>
        </div>

        <div className="finance-card">
          <h2 className="text-xl font-semibold mb-6">Your Assets</h2>
          <AssetList
            assets={assets}
            isLoading={isLoading}
            onRefresh={fetchAssets}
          />
        </div>
      </div>
    </Layout>
  );
}
