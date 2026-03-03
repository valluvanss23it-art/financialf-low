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
import { Plus, Loader } from 'lucide-react';

const incomeCategories = [
  { value: 'salary', label: '💼 Salary' },
  { value: 'freelance', label: '💻 Freelance Work' },
  { value: 'business', label: '🏢 Business Income' },
  { value: 'investments', label: '📈 Investment Returns' },
  { value: 'rental', label: '🏠 Rental Income' },
  { value: 'dividends', label: '💰 Dividends' },
  { value: 'interest', label: '🏦 Interest Income' },
  { value: 'bonus', label: '🎁 Bonus' },
  { value: 'commission', label: '📊 Commission' },
  { value: 'gifts', label: '🎀 Gifts & Grants' },
  { value: 'other', label: '📝 Other Income' },
];

const recurringOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

interface AddIncomeFormProps {
  onSuccess?: () => void;
}

export function AddIncomeForm({ onSuccess }: AddIncomeFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const data = {
        type: 'income',
        amount: parseFloat(formData.amount),
        category: formData.category,
        source: formData.source,
        description: formData.description || undefined,
        date: formData.date,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? formData.recurring_frequency : undefined,
      };

      const response = await transactionsAPI.create(data);
      toast.success('Income added successfully!');
      
      // Reset form
      setFormData({
        type: 'income',
        amount: '',
        category: '',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_frequency: '',
      });
      setIsRecurring(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add income');
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
          <Plus className="h-5 w-5" />
          Add Income
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

          {/* Source */}
          <div className="grid gap-2">
            <Label htmlFor="source">Income Source *</Label>
            <Input
              id="source"
              name="source"
              placeholder="e.g., Monthly Salary, Freelance Project"
              value={formData.source}
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
                {incomeCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add any notes about this income..."
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
              This is a recurring income
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
                <Plus className="mr-2 h-4 w-4" />
                Add Income
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
