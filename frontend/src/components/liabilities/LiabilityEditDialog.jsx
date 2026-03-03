import { useState } from 'react';
import { liabilitiesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

const liabilityTypes = [
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];

interface Liability {
  id: string;
  name: string;
  type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  outstanding_balance: number;
  next_emi_date: string | null;
  notes: string | null;
  is_paid_off: boolean;
}

interface LiabilityEditDialogProps {
  liability: Liability;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LiabilityEditDialog({ liability, open, onOpenChange, onSuccess }: LiabilityEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: liability.name,
    type: liability.type,
    outstanding_balance: String(liability.outstanding_balance),
    next_emi_date: liability.next_emi_date || '',
    notes: liability.notes || '',
    is_paid_off: liability.is_paid_off,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.outstanding_balance) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await liabilitiesAPI.update(liability.id, {
        name: formData.name,
        type: formData.type as any,
        outstanding_balance: parseFloat(formData.outstanding_balance),
        next_emi_date: formData.next_emi_date || null,
        notes: formData.notes || null,
        is_paid_off: formData.is_paid_off,
      });
      toast.success('Loan updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating liability:', error);
      toast.error('Failed to update loan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between">
              <span>Principal Amount:</span>
              <span className="font-medium">{formatCurrency(liability.principal_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Rate:</span>
              <span className="font-medium">{liability.interest_rate}% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly EMI:</span>
              <span className="font-medium">{formatCurrency(liability.emi_amount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Loan Name *</Label>
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
                  {liabilityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-outstanding">Outstanding Balance (₹) *</Label>
              <Input
                id="edit-outstanding"
                type="number"
                step="0.01"
                value={formData.outstanding_balance}
                onChange={(e) => setFormData({ ...formData, outstanding_balance: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-next_emi">Next EMI Date</Label>
              <Input
                id="edit-next_emi"
                type="date"
                value={formData.next_emi_date}
                onChange={(e) => setFormData({ ...formData, next_emi_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="is_paid_off" className="cursor-pointer">Mark as Paid Off</Label>
            <Switch
              id="is_paid_off"
              checked={formData.is_paid_off}
              onCheckedChange={(checked) => setFormData({ ...formData, is_paid_off: checked })}
            />
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
