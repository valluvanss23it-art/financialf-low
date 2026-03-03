import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { liabilitiesAPI } from '@/lib/api';
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

const liabilityTypes = [
  { value: 'home_loan', label: 'Home Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'education_loan', label: 'Education Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' },
];

interface LiabilityFormProps {
  onSuccess: () => void;
}

export function LiabilityForm({ onSuccess }: LiabilityFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'personal_loan',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: '',
    notes: '',
  });
  const [calculatedEMI, setCalculatedEMI] = useState<number | null>(null);

  // Calculate EMI when inputs change
  useEffect(() => {
    const principal = parseFloat(formData.principal_amount);
    const rate = parseFloat(formData.interest_rate);
    const tenure = parseInt(formData.tenure_months);

    if (principal > 0 && rate > 0 && tenure > 0) {
      const monthlyRate = rate / 12 / 100;
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                  (Math.pow(1 + monthlyRate, tenure) - 1);
      setCalculatedEMI(Math.round(emi));
    } else {
      setCalculatedEMI(null);
    }
  }, [formData.principal_amount, formData.interest_rate, formData.tenure_months]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.principal_amount || !formData.interest_rate || 
        !formData.tenure_months || !formData.start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!calculatedEMI) {
      toast.error('Unable to calculate EMI');
      return;
    }

    setIsSubmitting(true);

    const startDate = new Date(formData.start_date);
    const nextEMIDate = new Date(startDate);
    nextEMIDate.setMonth(nextEMIDate.getMonth() + 1);

    try {
      await liabilitiesAPI.create({
        name: formData.name,
        type: formData.type as any,
        principal_amount: parseFloat(formData.principal_amount),
        interest_rate: parseFloat(formData.interest_rate),
        tenure_months: parseInt(formData.tenure_months),
        emi_amount: calculatedEMI,
        start_date: formData.start_date,
        outstanding_balance: parseFloat(formData.principal_amount),
        next_emi_date: nextEMIDate.toISOString().split('T')[0],
        notes: formData.notes || null,
      });

      toast.success('Loan added successfully');
      setFormData({
        name: '',
        type: 'personal_loan',
        principal_amount: '',
        interest_rate: '',
        tenure_months: '',
        start_date: '',
        notes: '',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Error adding liability:', error);
      toast.error(error.message || 'Failed to add loan');
    }

    setIsSubmitting(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Loan Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., SBI Home Loan"
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
              {liabilityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal_amount">Principal Amount (₹) *</Label>
          <Input
            id="principal_amount"
            type="number"
            step="0.01"
            value={formData.principal_amount}
            onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest_rate">Interest Rate (% p.a.) *</Label>
          <Input
            id="interest_rate"
            type="number"
            step="0.01"
            value={formData.interest_rate}
            onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
            placeholder="8.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenure_months">Tenure (Months) *</Label>
          <Input
            id="tenure_months"
            type="number"
            value={formData.tenure_months}
            onChange={(e) => setFormData({ ...formData, tenure_months: e.target.value })}
            placeholder="60"
          />
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
      </div>

      {calculatedEMI && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Calculated Monthly EMI</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedEMI)}</p>
        </div>
      )}

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
        {isSubmitting ? 'Adding...' : 'Add Loan'}
      </Button>
    </form>
  );
}
