import { useEffect, useState } from 'react';
import { transactionsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: string;
}

export function FinancialSummaryCard() {
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    currency: 'USD',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const response = await transactionsAPI.getSummary();
      setSummary(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch summary:', error);
      // Silent fail - don't show toast on dashboard
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-l-4 border-l-green-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? '-' : formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All time income</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {isLoading ? '-' : formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">All time expenses</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}
          >
            {isLoading ? '-' : formatCurrency(summary.balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
        </CardContent>
      </Card>
    </div>
  );
}
