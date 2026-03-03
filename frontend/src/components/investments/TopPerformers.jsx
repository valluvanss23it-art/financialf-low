import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Asset {
  id: string;
  name: string;
  type: string;
  current_value: number;
  purchase_value: number | null;
}

interface TopPerformersProps {
  assets: Asset[];
  loading?: boolean;
}

const typeLabels: Record<string, string> = {
  stocks: 'Stocks',
  mutual_funds: 'MF',
  crypto: 'Crypto',
  gold: 'Gold',
  fd: 'FD',
  other: 'Other',
};

export function TopPerformers({ assets, loading }: TopPerformersProps) {
  if (loading) {
    return (
      <div className="finance-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const assetsWithReturns = assets
    .filter(a => a.purchase_value && Number(a.purchase_value) > 0)
    .map(asset => {
      const returnPercent = ((Number(asset.current_value) - Number(asset.purchase_value!)) / Number(asset.purchase_value!)) * 100;
      const returnValue = Number(asset.current_value) - Number(asset.purchase_value!);
      return {
        ...asset,
        returnPercent,
        returnValue,
      };
    })
    .sort((a, b) => b.returnPercent - a.returnPercent);

  const topPerformers = assetsWithReturns.slice(0, 3);
  const bottomPerformers = [...assetsWithReturns].sort((a, b) => a.returnPercent - b.returnPercent).slice(0, 3);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (assetsWithReturns.length === 0) {
    return (
      <div className="finance-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Leaders</h3>
        <div className="text-center py-8 text-muted-foreground">
          Add purchase values to see top performers
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top Performers */}
      <div className="finance-card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
        </div>
        <div className="space-y-3">
          {topPerformers.map((asset, index) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">#{index + 1}</span>
                <div>
                  <div className="font-medium text-foreground">{asset.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {typeLabels[asset.type] || asset.type}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +{asset.returnPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(asset.returnValue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Performers */}
      <div className="finance-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Needs Attention</h3>
        </div>
        <div className="space-y-3">
          {bottomPerformers.map((asset, index) => (
            <div
              key={asset.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                asset.returnPercent < 0 
                  ? 'bg-destructive/5 border border-destructive/20' 
                  : 'bg-muted/50 border border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${asset.returnPercent < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  #{index + 1}
                </span>
                <div>
                  <div className="font-medium text-foreground">{asset.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {typeLabels[asset.type] || asset.type}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 font-semibold ${
                  asset.returnPercent < 0 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {asset.returnPercent < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {asset.returnPercent >= 0 ? '+' : ''}{asset.returnPercent.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(asset.returnValue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
