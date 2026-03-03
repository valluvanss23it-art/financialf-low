import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { assetsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface AssetFormProps {
  onSuccess: () => void;
}

export function AssetForm({ onSuccess }: AssetFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    current_value: '',
    purchase_value: '',
    purchase_date: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.current_value) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await assetsAPI.create({
        name: formData.name,
        type: formData.type,
        current_value: parseFloat(formData.current_value),
        purchase_value: formData.purchase_value ? parseFloat(formData.purchase_value) : null,
        purchase_date: formData.purchase_date || null,
        notes: formData.notes || null,
      });

      toast.success('Asset added successfully');
      setFormData({
        name: '',
        type: 'other',
        current_value: '',
        purchase_value: '',
        purchase_date: '',
        notes: '',
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error('Failed to add asset');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., HDFC Savings Account"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
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
          <Label htmlFor="current_value">Current Value (₹) *</Label>
          <Input
            id="current_value"
            type="number"
            step="0.01"
            value={formData.current_value}
            onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_value">Purchase Value (₹)</Label>
          <Input
            id="purchase_value"
            type="number"
            step="0.01"
            value={formData.purchase_value}
            onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional details..."
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Asset'}
      </Button>
    </form>
  );
}
