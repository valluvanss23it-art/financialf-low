import { useState } from 'react';
import { format } from 'date-fns';
import { incomeAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2, RefreshCw, Loader2 } from 'lucide-react';

type Income = any;

const categoryLabels: Record<string, { label: string; color: string }> = {
  salary: { label: '💼 Salary', color: 'bg-primary/10 text-primary' },
  freelance: { label: '💻 Freelance', color: 'bg-secondary/10 text-secondary' },
  business: { label: '🏢 Business', color: 'bg-info/10 text-info' },
  investments: { label: '📈 Investments', color: 'bg-success/10 text-success' },
  rental: { label: '🏠 Rental', color: 'bg-warning/10 text-warning' },
  dividends: { label: '💰 Dividends', color: 'bg-accent/10 text-accent-foreground' },
  interest: { label: '🏦 Interest', color: 'bg-muted text-muted-foreground' },
  bonus: { label: '🎁 Bonus', color: 'bg-primary/10 text-primary' },
  commission: { label: '📊 Commission', color: 'bg-secondary/10 text-secondary' },
  gifts: { label: '🎀 Gifts', color: 'bg-info/10 text-info' },
  other: { label: '📝 Other', color: 'bg-muted text-muted-foreground' },
};

interface IncomeListProps {
  incomes: Income[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function IncomeList({ incomes, isLoading, onRefresh }: IncomeListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      await incomeAPI.delete(deleteId);
      toast.success('Income deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete income');
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No income records yet. Add your first income entry above!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income._id || income.id}>
                <TableCell className="font-medium">
                  {format(new Date(income.date), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{income.source}</p>
                    {income.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {income.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={categoryLabels[income.category]?.color || ''}
                  >
                    {categoryLabels[income.category]?.label || income.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-success">
                  {formatCurrency(Number(income.amount))}
                </TableCell>
                <TableCell>
                  {income.is_recurring ? (
                    <Badge variant="outline" className="text-xs">
                      {income.recurring_frequency}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(income.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
