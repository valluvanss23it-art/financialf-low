import { useState } from 'react';
import { assetsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const assetTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Account' },
  { value: 'fd', label: 'Fixed Deposit' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_funds', label: 'Mutual Funds' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'gold', label: 'Gold' },
  { value: 'property', label: 'Property' },
  { value: 'other', label: 'Other' },
];

interface Asset {
  id: string;
  name: string;
  type: string;
  current_value: number;
  purchase_value: number | null;
  purchase_date: string | null;
  notes: string | null;
}

interface AssetEditDialogProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssetEditDialog({ asset, open, onOpenChange, onSuccess }: AssetEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: asset.name,
    type: asset.type,
    current_value: String(asset.current_value),
    purchase_value: asset.purchase_value ? String(asset.purchase_value) : '',
    purchase_date: asset.purchase_date || '',
    notes: asset.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.current_value) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await assetsAPI.update(asset.id, {
        name: formData.name,
        type: formData.type as any,
        current_value: parseFloat(formData.current_value),
        purchase_value: formData.purchase_value ? parseFloat(formData.purchase_value) : null,
        purchase_date: formData.purchase_date || null,
        notes: formData.notes || null,
        last_updated: new Date().toISOString().split('T')[0],
      });
      toast.success('Asset updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Asset Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-current_value">Current Value (₹) *</Label>
              <Input
                id="edit-current_value"
                type="number"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-purchase_value">Purchase Value (₹)</Label>
              <Input
                id="edit-purchase_value"
                type="number"
                step="0.01"
                value={formData.purchase_value}
                onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-purchase_date">Purchase Date</Label>
              <Input
                id="edit-purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
