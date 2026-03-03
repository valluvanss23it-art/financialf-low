import { useState, useEffect } from 'react';
import { goalsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Save, RefreshCw } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  priority: string;
  notes: string | null;
  is_completed: boolean;
  recurring_amount?: number;
  recurring_frequency?: string;
  last_contribution_date?: string | null;
}

interface GoalEditDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
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

export function GoalEditDialog({ goal, open, onOpenChange, onUpdate }: GoalEditDialogProps) {
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

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount.toString(),
        current_amount: goal.current_amount.toString(),
        deadline: goal.deadline || '',
        category: goal.category,
        priority: goal.priority,
        notes: goal.notes || '',
        recurring_amount: goal.recurring_amount?.toString() || '0',
        recurring_frequency: goal.recurring_frequency || 'none'
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    if (!formData.name || !formData.target_amount) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const newCurrentAmount = parseFloat(formData.current_amount) || 0;
      const newTargetAmount = parseFloat(formData.target_amount);
      const isCompleted = newCurrentAmount >= newTargetAmount;

      await goalsAPI.update(goal.id, {
        name: formData.name.trim(),
        target_amount: newTargetAmount,
        current_amount: newCurrentAmount,
        deadline: formData.deadline || null,
        category: formData.category,
        priority: formData.priority,
        notes: formData.notes.trim() || null,
        is_completed: isCompleted,
        recurring_amount: parseFloat(formData.recurring_amount) || 0,
        recurring_frequency: formData.recurring_frequency
      });

      toast.success('Goal updated successfully!');
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Goal Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Emergency Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-target">Target Amount (₹) *</Label>
              <Input
                id="edit-target"
                type="number"
                min="1"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-current">Current Saved (₹)</Label>
              <Input
                id="edit-current"
                type="number"
                min="0"
                value={formData.current_amount}
                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-deadline">Target Date</Label>
            <Input
              id="edit-deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          {/* Recurring Contribution Section */}
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Recurring Contribution</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-frequency" className="text-xs">Frequency</Label>
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
                <Label htmlFor="edit-recurring-amount" className="text-xs">Amount (₹)</Label>
                <Input
                  id="edit-recurring-amount"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
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
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              maxLength={500}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
