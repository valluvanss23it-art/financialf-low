import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { transactionsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Minus, Loader } from 'lucide-react';

const expenseCategories = [
  { value: 'groceries', label: '🛒 Groceries' },
  { value: 'food', label: '🍔 Food & Dining' },
  { value: 'transport', label: '🚗 Transport & Fuel' },
  { value: 'utilities', label: '💡 Utilities' },
  { value: 'rent', label: '🏠 Rent & Housing' },
  { value: 'healthcare', label: '🏥 Healthcare & Medical' },
  { value: 'education', label: '📚 Education' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛍️ Shopping & Clothing' },
  { value: 'insurance', label: '🛡️ Insurance' },
  { value: 'subscriptions', label: '📱 Subscriptions' },
  { value: 'travel', label: '✈️ Travel & Vacation' },
  { value: 'personal_care', label: '💅 Personal Care' },
  { value: 'household', label: '🏡 Household & Repairs' },
  { value: 'gifts', label: '🎁 Gifts & Donations' },
  { value: 'other', label: '📝 Other' },
];

const paymentMethods = [
  { value: 'cash', label: '💵 Cash' },
  { value: 'credit_card', label: '💳 Credit Card' },
  { value: 'debit_card', label: '💳 Debit Card' },
  { value: 'upi', label: '📱 UPI' },
  { value: 'net_banking', label: '🏦 Net Banking' },
  { value: 'wallet', label: '👛 Digital Wallet' },
  { value: 'check', label: '📋 Cheque' },
];

const recurringOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

interface AddExpenseFormProps {
  onSuccess?: () => void;
}

export function AddExpenseForm({ onSuccess }: AddExpenseFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    merchant: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    is_recurring: false,
    recurring_frequency: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const data = {
        type: 'expense',
        amount: parseFloat(formData.amount),
        category: formData.category,
        merchant: formData.merchant || undefined,
        description: formData.description || undefined,
        date: formData.date,
        payment_method: formData.payment_method,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? formData.recurring_frequency : undefined,
      };

      const response = await transactionsAPI.create(data);
      toast.success('Expense added successfully!');
      
      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        merchant: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        is_recurring: false,
        recurring_frequency: '',
      });
      setIsRecurring(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minus className="h-5 w-5" />
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Merchant */}
          <div className="grid gap-2">
            <Label htmlFor="merchant">Merchant/Store (Optional)</Label>
            <Input
              id="merchant"
              name="merchant"
              placeholder="e.g., Whole Foods, Amazon, Starbucks"
              value={formData.merchant}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Payment Method */}
          <div className="grid gap-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => handleSelectChange('payment_method', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add any notes about this expense..."
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              disabled={isLoading}
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              This is a recurring expense
            </Label>
          </div>

          {/* Recurring Frequency */}
          {isRecurring && (
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.recurring_frequency}
                onValueChange={(value) => handleSelectChange('recurring_frequency', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {recurringOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Minus className="mr-2 h-4 w-4" />
                Add Expense
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
