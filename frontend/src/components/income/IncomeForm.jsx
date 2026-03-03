import { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { incomeAPI } from '@/lib/api';
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
import { toast } from 'sonner';
import { Plus, AlertCircle } from 'lucide-react';

type IncomeCategory = Database['public']['Enums']['income_category'];

const incomeCategories: { value: IncomeCategory; label: string }[] = [
  { value: 'salary', label: '💼 Salary' },
  { value: 'freelance', label: '💻 Freelance' },
  { value: 'business', label: '🏢 Business' },
  { value: 'investments', label: '📈 Investments' },
  { value: 'rental', label: '🏠 Rental' },
  { value: 'dividends', label: '💰 Dividends' },
  { value: 'interest', label: '🏦 Interest' },
  { value: 'bonus', label: '🎁 Bonus' },
  { value: 'commission', label: '📊 Commission' },
  { value: 'gifts', label: '🎀 Gifts' },
  { value: 'other', label: '📝 Other' },
];

const recurringOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const incomeSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  source: z.string().trim().min(1, 'Source is required').max(100),
  description: z.string().trim().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
  isRecurring: z.boolean(),
  recurringFrequency: z.string().optional(),
});

interface IncomeFormProps {
  onSuccess: () => void;
}

export function IncomeForm({ onSuccess }: IncomeFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('salary');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  const resetForm = () => {
    setAmount('');
    setCategory('salary');
    setSource('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const data = incomeSchema.parse({
        amount: parseFloat(amount),
        category,
        source,
        description: description || undefined,
        date,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
      });

      const { error } = await incomeAPI.create({
        amount: data.amount,
        category: data.category,
        source: data.source,
        description: data.description || null,
        date: data.date,
        is_recurring: data.isRecurring,
        recurring_frequency: data.recurringFrequency || null,
      }).catch(err => ({ error: err }));

      if (error) {
        toast.error('Failed to add income: ' + error.message);
      } else {
        toast.success('Income added successfully!');
        resetForm();
        onSuccess();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.amount}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as IncomeCategory)}>
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
          {errors.category && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.category}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            type="text"
            placeholder="e.g., ABC Company, Client XYZ"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          {errors.source && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.source}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.date}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Add any notes about this income..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div>
          <Label htmlFor="recurring" className="text-base font-medium">
            Recurring Income
          </Label>
          <p className="text-sm text-muted-foreground">
            Is this a regular income source?
          </p>
        </div>
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2 animate-fade-in">
          <Label htmlFor="frequency">Recurring Frequency</Label>
          <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
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

      <Button type="submit" className="w-full" disabled={isLoading}>
        <Plus className="w-4 h-4 mr-2" />
        {isLoading ? 'Adding...' : 'Add Income'}
      </Button>
    </form>
  );
}
