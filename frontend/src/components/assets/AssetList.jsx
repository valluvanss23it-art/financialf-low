import { useState } from 'react';
import { Trash2, Pencil, TrendingUp, TrendingDown } from 'lucide-react';
import { assetsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AssetEditDialog } from './AssetEditDialog';

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

interface AssetListProps {
  assets: Asset[];
  isLoading: boolean;
  onRefresh: () => void;
}

const typeLabels: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank Account',
  fd: 'Fixed Deposit',
  stocks: 'Stocks',
  mutual_funds: 'Mutual Funds',
  crypto: 'Cryptocurrency',
  gold: 'Gold',
  property: 'Property',
  other: 'Other',
};

const typeColors: Record<string, string> = {
  cash: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  bank: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  fd: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  stocks: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  mutual_funds: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  crypto: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  gold: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  property: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function AssetList({ assets, isLoading, onRefresh }: AssetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await assetsAPI.delete(id);
      toast.success('Asset deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete asset');
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No assets added yet. Start tracking your assets!
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

          return (
            <div
              key={asset.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground">{asset.name}</h3>
                  <Badge variant="outline" className={typeColors[asset.type]}>
                    {typeLabels[asset.type]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {asset.purchase_value && (
                    <span>Purchased: {formatCurrency(Number(asset.purchase_value))}</span>
                  )}
                  {gainLoss !== null && (
                    <span className={`flex items-center gap-1 ${gainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {gainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLossPercent}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(Number(asset.current_value))}
                </span>
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
