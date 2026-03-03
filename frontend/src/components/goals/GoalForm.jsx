import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { goalsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Target, Plus, RefreshCw } from 'lucide-react';

interface GoalFormProps {
  onGoalAdded: () => void;
}

const categories = [
  'Emergency Fund',
  'Vacation',
  'Home',
  'Car',
  'Education',
  'Retirement',
  'Wedding',
  'Gadgets',
  'Investment',
  'Other'
];

const priorities = ['low', 'medium', 'high'];
const frequencies = [
  { value: 'none', label: 'No recurring' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export function GoalForm({ onGoalAdded }: GoalFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    category: 'Other',
    priority: 'medium',
    notes: '',
    recurring_amount: '',
    recurring_frequency: 'none'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add goals');
      return;
    }

    if (!formData.name || !formData.target_amount) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await goalsAPI.create({
        name: formData.name.trim(),
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        deadline: formData.deadline || null,
        category: formData.category,
        priority: formData.priority,
        notes: formData.notes.trim() || null,
        recurring_amount: parseFloat(formData.recurring_amount) || 0,
        recurring_frequency: formData.recurring_frequency
      });

      toast.success('Goal added successfully!');
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        category: 'Other',
        priority: 'medium',
        notes: '',
        recurring_amount: '',
        recurring_frequency: 'none'
      });
      onGoalAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Add New Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Emergency Fund"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Target Amount (₹) *</Label>
              <Input
                id="target_amount"
                type="number"
                placeholder="100000"
                min="1"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_amount">Current Saved (₹)</Label>
              <Input
                id="current_amount"
                type="number"
                placeholder="0"
                min="0"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Target Date</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          {/* Recurring Contribution Section */}
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Recurring Contribution</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurring_frequency">Frequency</Label>
                <Select 
                  value={formData.recurring_frequency} 
                  onValueChange={(v) => setFormData({ ...formData, recurring_frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurring_amount">Amount per Contribution (₹)</Label>
                <Input
                  id="recurring_amount"
                  type="number"
                  placeholder="5000"
                  min="0"
                  value={formData.recurring_amount}
                  onChange={(e) => setFormData({ ...formData, recurring_amount: e.target.value })}
                  disabled={formData.recurring_frequency === 'none'}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                maxLength={500}
                rows={1}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Adding...' : 'Add Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
