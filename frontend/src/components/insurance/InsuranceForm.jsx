import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { insuranceAPI } from '@/lib/api';
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

interface InsuranceFormProps {
  onSuccess: () => void;
}

export function InsuranceForm({ onSuccess }: InsuranceFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'health',
    provider: '',
    policy_number: '',
    coverage_amount: '',
    premium_amount: '',
    premium_frequency: 'yearly',
    start_date: '',
    end_date: '',
    next_premium_date: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.provider || !formData.coverage_amount || 
        !formData.premium_amount || !formData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await insuranceAPI.create({
        name: formData.name,
        type: formData.type as any,
        provider: formData.provider,
        policy_number: formData.policy_number || null,
        coverage_amount: parseFloat(formData.coverage_amount),
        premium_amount: parseFloat(formData.premium_amount),
        premium_frequency: formData.premium_frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        next_premium_date: formData.next_premium_date || null,
        notes: formData.notes || null,
      });
      toast.success('Policy added successfully');
      setFormData({
        name: '',
        type: 'health',
        provider: '',
        policy_number: '',
        coverage_amount: '',
        premium_amount: '',
        premium_frequency: 'yearly',
        start_date: '',
        end_date: '',
        next_premium_date: '',
        notes: '',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Error adding insurance:', error);
      toast.error(error.message || 'Failed to add policy');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Policy Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., HDFC Ergo Health"
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
              {insuranceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="provider">Provider *</Label>
          <Input
            id="provider"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            placeholder="e.g., HDFC Ergo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="policy_number">Policy Number</Label>
          <Input
            id="policy_number"
            value={formData.policy_number}
            onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
            placeholder="e.g., POL123456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverage_amount">Coverage Amount (₹) *</Label>
          <Input
            id="coverage_amount"
            type="number"
            step="0.01"
            value={formData.coverage_amount}
            onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
            placeholder="500000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="premium_amount">Premium Amount (₹) *</Label>
          <Input
            id="premium_amount"
            type="number"
            step="0.01"
            value={formData.premium_amount}
            onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
            placeholder="15000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="premium_frequency">Premium Frequency *</Label>
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
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_premium_date">Next Premium Date</Label>
          <Input
            id="next_premium_date"
            type="date"
            value={formData.next_premium_date}
            onChange={(e) => setFormData({ ...formData, next_premium_date: e.target.value })}
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
        {isSubmitting ? 'Adding...' : 'Add Policy'}
      </Button>
    </form>
  );
}
