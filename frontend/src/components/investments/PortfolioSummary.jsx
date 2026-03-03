import { TrendingUp, TrendingDown, PieChart, BarChart3, Percent } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

interface Asset {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  currentValue?: number;
  current_value?: number;
  amount?: number;
  purchase_value?: number;
  purchaseDate?: string;
  purchase_date?: string;
}

interface PortfolioSummaryProps {
  assets: Asset[];
  loading?: boolean;
}

export function PortfolioSummary({ assets, loading }: PortfolioSummaryProps) {
  // Safely extract values with fallbacks for both camelCase and snake_case
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const totalCurrentValue = assets.reduce((sum, a) => {
    const val = safeNumber(a.currentValue || a.current_value);
    return sum + val;
  }, 0);

  const totalPurchaseValue = assets.reduce((sum, a) => {
    const val = safeNumber(a.amount || a.purchase_value);
    return sum + val;
  }, 0);

  const totalGainLoss = totalCurrentValue - totalPurchaseValue;
  const totalReturnPercent = totalPurchaseValue > 0 
    ? ((totalGainLoss / totalPurchaseValue) * 100).toFixed(2) 
    : '0.00';

  // Calculate XIRR approximation (simplified annual return)
  const calculateAnnualReturn = () => {
    const assetsWithDates = assets.filter(a => {
      const dateVal = a.purchaseDate || a.purchase_date;
      const amountVal = a.amount || a.purchase_value;
      return dateVal && safeNumber(amountVal) > 0;
    });

    if (assetsWithDates.length === 0) return '0.00';

    let totalWeightedReturn = 0;
    let totalWeight = 0;

    assetsWithDates.forEach(asset => {
      const purchaseDate = new Date(asset.purchaseDate || asset.purchase_date || '');
      const today = new Date();
      const years = (today.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      
      const purchaseVal = safeNumber(asset.amount || asset.purchase_value);
      const currentVal = safeNumber(asset.currentValue || asset.current_value);

      if (years > 0.1 && purchaseVal > 0) {
        const absoluteReturn = (currentVal - purchaseVal) / purchaseVal;
        const annualReturn = years > 0 ? Math.pow(Math.max(0, 1 + absoluteReturn), 1 / years) - 1 : 0;
        totalWeightedReturn += annualReturn * purchaseVal;
        totalWeight += purchaseVal;
      }
    });

    return totalWeight > 0 ? ((totalWeightedReturn / totalWeight) * 100).toFixed(2) : '0.00';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted/50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Portfolio Value"
        value={totalCurrentValue}
        icon={<PieChart className="w-5 h-5" />}
        variant="income"
      />
      <StatCard
        title="Invested Amount"
        value={totalPurchaseValue}
        icon={<BarChart3 className="w-5 h-5" />}
        variant="neutral"
      />
      <StatCard
        title="Total Returns"
        value={totalGainLoss}
        icon={totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        variant={totalGainLoss >= 0 ? 'income' : 'expense'}
        subtitle={`${totalGainLoss >= 0 ? '+' : ''}${totalReturnPercent}%`}
      />
      <StatCard
        title="Annual Return (CAGR)"
        value={`${calculateAnnualReturn()}%`}
        icon={<Percent className="w-5 h-5" />}
        variant="savings"
        subtitle="Compound growth rate"
      />
    </div>
  );
}
