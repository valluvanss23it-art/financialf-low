import { useState } from 'react';
import { insuranceAPI } from '@/lib/api';
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

const insuranceTypes = [
  { value: 'health', label: 'Health Insurance' },
  { value: 'life', label: 'Life Insurance' },
  { value: 'vehicle', label: 'Vehicle Insurance' },
  { value: 'property', label: 'Property Insurance' },
  { value: 'other', label: 'Other' },
];

const premiumFrequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half-Yearly' },
  { value: 'yearly', label: 'Yearly' },
];

interface Insurance {
  id: string;
  name: string;
  type: string;
  provider: string;
  policy_number: string | null;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency: string;
  end_date: string | null;
  next_premium_date: string | null;
  notes: string | null;
  is_active: boolean;
}

interface InsuranceEditDialogProps {
  policy: Insurance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InsuranceEditDialog({ policy, open, onOpenChange, onSuccess }: InsuranceEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: policy.name,
    type: policy.type,
    provider: policy.provider,
    policy_number: policy.policy_number || '',
    coverage_amount: String(policy.coverage_amount),
    premium_amount: String(policy.premium_amount),
    premium_frequency: policy.premium_frequency,
    end_date: policy.end_date || '',
    next_premium_date: policy.next_premium_date || '',
    notes: policy.notes || '',
    is_active: policy.is_active,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.provider || !formData.coverage_amount || !formData.premium_amount) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await insuranceAPI.update(policy.id, {
        name: formData.name,
        type: formData.type as any,
        provider: formData.provider,
        policy_number: formData.policy_number || null,
        coverage_amount: parseFloat(formData.coverage_amount),
        premium_amount: parseFloat(formData.premium_amount),
        premium_frequency: formData.premium_frequency,
        end_date: formData.end_date || null,
        next_premium_date: formData.next_premium_date || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
      });
      toast.success('Policy updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Insurance Policy</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Policy Name *</Label>
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
                  {insuranceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-provider">Provider *</Label>
              <Input
                id="edit-provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-policy_number">Policy Number</Label>
              <Input
                id="edit-policy_number"
                value={formData.policy_number}
                onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-coverage">Coverage Amount (₹) *</Label>
              <Input
                id="edit-coverage"
                type="number"
                step="0.01"
                value={formData.coverage_amount}
                onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-premium">Premium Amount (₹) *</Label>
              <Input
                id="edit-premium"
                type="number"
                step="0.01"
                value={formData.premium_amount}
                onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-frequency">Premium Frequency *</Label>
              <Select
                value={formData.premium_frequency}
                onValueChange={(value) => setFormData({ ...formData, premium_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {premiumFrequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end_date">End Date</Label>
              <Input
                id="edit-end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-next_premium">Next Premium Date</Label>
              <Input
                id="edit-next_premium"
                type="date"
                value={formData.next_premium_date}
                onChange={(e) => setFormData({ ...formData, next_premium_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor="is_active" className="cursor-pointer">Policy Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
