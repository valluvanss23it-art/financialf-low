import { useState } from 'react';
import { TrendingUp, TrendingDown, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { assetsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AssetEditDialog } from '@/components/assets/AssetEditDialog';

interface Asset {
  id: string;
  name: string;
  type: string;
  current_value: number;
  purchase_value: number | null;
  purchase_date: string | null;
  notes: string | null;
  last_updated: string;
}

interface InvestmentListProps {
  assets: Asset[];
  isLoading: boolean;
  onRefresh: () => void;
}

const typeLabels: Record<string, string> = {
  stocks: 'Stocks',
  mutual_funds: 'Mutual Funds',
  crypto: 'Cryptocurrency',
  gold: 'Gold',
  fd: 'Fixed Deposit',
  other: 'Other',
};

const typeColors: Record<string, string> = {
  stocks: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  mutual_funds: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  crypto: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  gold: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  fd: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function InvestmentList({ assets, isLoading, onRefresh }: InvestmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await assetsAPI.delete(id);
      toast.success('Investment deleted');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete investment');
    }
    setDeletingId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateCAGR = (currentValue: number, purchaseValue: number, purchaseDate: string) => {
    const today = new Date();
    const purchase = new Date(purchaseDate);
    const years = differenceInDays(today, purchase) / 365.25;
    
    if (years <= 0 || purchaseValue <= 0) return null;
    
    const cagr = (Math.pow(currentValue / purchaseValue, 1 / years) - 1) * 100;
    return cagr.toFixed(2);
  };

  const calculateHoldingPeriod = (purchaseDate: string) => {
    const today = new Date();
    const purchase = new Date(purchaseDate);
    const days = differenceInDays(today, purchase);
    
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    return months > 0 ? `${years}y ${months}m` : `${years} years`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-2">No investments found.</p>
        <p className="text-sm">Add stocks, mutual funds, or other investments to track your portfolio.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {assets.map((asset) => {
          const gainLoss = asset.purchase_value
            ? Number(asset.current_value) - Number(asset.purchase_value)
            : null;
          const gainLossPercent = asset.purchase_value
            ? ((gainLoss! / Number(asset.purchase_value)) * 100).toFixed(1)
            : null;
          const cagr = asset.purchase_date && asset.purchase_value
            ? calculateCAGR(Number(asset.current_value), Number(asset.purchase_value), asset.purchase_date)
            : null;
          const holdingPeriod = asset.purchase_date
            ? calculateHoldingPeriod(asset.purchase_date)
            : null;

          return (
            <div
              key={asset.id}
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{asset.name}</h3>
                    <Badge variant="outline" className={typeColors[asset.type] || typeColors.other}>
                      {typeLabels[asset.type] || asset.type}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {asset.purchase_value && (
                      <span className="flex items-center gap-1">
                        <span className="text-xs">Invested:</span>
                        {formatCurrency(Number(asset.purchase_value))}
                      </span>
                    )}
                    {asset.purchase_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(asset.purchase_date), 'dd MMM yyyy')}
                      </span>
                    )}
                    {holdingPeriod && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {holdingPeriod}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Returns Section */}
                  <div className="text-right">
                    {gainLoss !== null && (
                      <div className={`flex items-center gap-1 text-sm ${gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {gainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}</span>
                        <span className="text-xs">({gainLossPercent}%)</span>
                      </div>
                    )}
                    {cagr && (
                      <div className="text-xs text-muted-foreground mt-1">
                        CAGR: <span className={Number(cagr) >= 0 ? 'text-emerald-600' : 'text-red-600'}>{cagr}%</span>
                      </div>
                    )}
                  </div>

                  {/* Current Value */}
                  <div className="text-right min-w-[100px]">
                    <div className="text-lg font-bold text-foreground">
                      {formatCurrency(Number(asset.current_value))}
                    </div>
                    <div className="text-xs text-muted-foreground">Current Value</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingAsset(asset)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(asset.id)}
                      disabled={deletingId === asset.id}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingAsset && (
        <AssetEditDialog
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(open) => !open && setEditingAsset(null)}
          onSuccess={() => {
            setEditingAsset(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
