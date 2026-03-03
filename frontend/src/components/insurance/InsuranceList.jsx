import { useState } from 'react';
import { Trash2, Pencil, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { insuranceAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { InsuranceEditDialog } from './InsuranceEditDialog';
import { format, differenceInDays } from 'date-fns';

interface Insurance {
  id: string;
  name: string;
  type: string;
  provider: string;
  policy_number: string | null;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency: string;
  start_date: string;
  end_date: string | null;
  next_premium_date: string | null;
  notes: string | null;
  is_active: boolean;
}

interface InsuranceListProps {
  policies: Insurance[];
  isLoading: boolean;
  onRefresh: () => void;
}

const typeLabels: Record<string, string> = {
  health: 'Health',
  life: 'Life',
  vehicle: 'Vehicle',
  property: 'Property',
  other: 'Other',
};

const typeColors: Record<string, string> = {
  health: 'bg-red-500/10 text-red-600 border-red-500/20',
  life: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  vehicle: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  property: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

const frequencyLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  'half-yearly': 'Half-Yearly',
  yearly: 'Yearly',
};

export function InsuranceList({ policies, isLoading, onRefresh }: InsuranceListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Insurance | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await insuranceAPI.delete(id);
      toast.success('Policy deleted');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete policy');
    }
    setDeletingId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRenewalStatus = (nextDate: string | null) => {
    if (!nextDate) return null;
    const days = differenceInDays(new Date(nextDate), new Date());
    if (days < 0) return { label: 'Overdue', color: 'bg-red-500' };
    if (days <= 7) return { label: 'Due Soon', color: 'bg-amber-500' };
    if (days <= 30) return { label: 'Upcoming', color: 'bg-blue-500' };
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No insurance policies added yet. Start tracking your coverage!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {policies.map((policy) => {
          const renewalStatus = getRenewalStatus(policy.next_premium_date);

          return (
            <div
              key={policy.id}
              className={`p-4 rounded-lg border ${policy.is_active ? 'border-border bg-card' : 'bg-muted/50 border-muted'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-foreground">{policy.name}</h3>
                    <Badge variant="outline" className={typeColors[policy.type]}>
                      {typeLabels[policy.type]}
                    </Badge>
                    {!policy.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {renewalStatus && policy.is_active && (
                      <Badge className={renewalStatus.color}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {renewalStatus.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{policy.provider}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Coverage: {formatCurrency(Number(policy.coverage_amount))}</span>
                    <span>Premium: {formatCurrency(Number(policy.premium_amount))} ({frequencyLabels[policy.premium_frequency]})</span>
                    {policy.policy_number && (
                      <span>Policy #: {policy.policy_number}</span>
                    )}
                  </div>
                  {policy.next_premium_date && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Next Premium: {format(new Date(policy.next_premium_date), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingPolicy(policy)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(policy.id)}
                    disabled={deletingId === policy.id}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingPolicy && (
        <InsuranceEditDialog
          policy={editingPolicy}
          open={!!editingPolicy}
          onOpenChange={(open) => !open && setEditingPolicy(null)}
          onSuccess={() => {
            setEditingPolicy(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
