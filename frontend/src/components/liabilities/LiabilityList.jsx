import { useState } from 'react';
import { Trash2, Pencil, Calendar, Percent, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { liabilitiesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { LiabilityEditDialog } from './LiabilityEditDialog';
import { AmortizationSchedule } from './AmortizationSchedule';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Liability {
  id: string;
  name: string;
  type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  start_date: string;
  outstanding_balance: number;
  next_emi_date: string | null;
  notes: string | null;
  is_paid_off: boolean;
}

interface LiabilityListProps {
  liabilities: Liability[];
  isLoading: boolean;
  onRefresh: () => void;
}

const typeLabels: Record<string, string> = {
  home_loan: 'Home Loan',
  car_loan: 'Car Loan',
  personal_loan: 'Personal Loan',
  education_loan: 'Education Loan',
  credit_card: 'Credit Card',
  other: 'Other',
};

const typeColors: Record<string, string> = {
  home_loan: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  car_loan: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  personal_loan: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  education_loan: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  credit_card: 'bg-red-500/10 text-red-600 border-red-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function LiabilityList({ liabilities, isLoading, onRefresh }: LiabilityListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [scheduleForLiability, setScheduleForLiability] = useState<Liability | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await liabilitiesAPI.delete(id);
      toast.success('Loan deleted');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete loan');
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (liabilities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No loans added yet. Start tracking your liabilities!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {liabilities.map((liability) => {
          const paidAmount = Number(liability.principal_amount) - Number(liability.outstanding_balance);
          const progressPercent = (paidAmount / Number(liability.principal_amount)) * 100;

          return (
            <div
              key={liability.id}
              className={`p-4 rounded-lg border ${liability.is_paid_off ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' : 'border-border bg-card'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{liability.name}</h3>
                    <Badge variant="outline" className={typeColors[liability.type]}>
                      {typeLabels[liability.type]}
                    </Badge>
                    {liability.is_paid_off && (
                      <Badge className="bg-emerald-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Paid Off
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {liability.interest_rate}% p.a.
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {liability.tenure_months} months
                    </span>
                    {liability.next_emi_date && !liability.is_paid_off && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Next EMI: {format(new Date(liability.next_emi_date), 'dd MMM yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(Number(liability.outstanding_balance))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      EMI: {formatCurrency(Number(liability.emi_amount))}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setScheduleForLiability(liability)}
                      title="View Amortization Schedule"
                    >
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingLiability(liability)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(liability.id)}
                      disabled={deletingId === liability.id}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Progress</span>
                  <span className="font-medium">{progressPercent.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Paid: {formatCurrency(paidAmount)}</span>
                  <span>Total: {formatCurrency(Number(liability.principal_amount))}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingLiability && (
        <LiabilityEditDialog
          liability={editingLiability}
          open={!!editingLiability}
          onOpenChange={(open) => !open && setEditingLiability(null)}
          onSuccess={() => {
            setEditingLiability(null);
            onRefresh();
          }}
        />
      )}

      {/* Amortization Schedule Dialog */}
      <Dialog open={!!scheduleForLiability} onOpenChange={(open) => !open && setScheduleForLiability(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Amortization Schedule - {scheduleForLiability?.name}
            </DialogTitle>
          </DialogHeader>
          {scheduleForLiability && (
            <AmortizationSchedule
              principalAmount={Number(scheduleForLiability.principal_amount)}
              interestRate={Number(scheduleForLiability.interest_rate)}
              tenureMonths={Number(scheduleForLiability.tenure_months)}
              emiAmount={Number(scheduleForLiability.emi_amount)}
              startDate={scheduleForLiability.start_date}
              outstandingBalance={Number(scheduleForLiability.outstanding_balance)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
