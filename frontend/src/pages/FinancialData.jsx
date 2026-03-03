import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddIncomeForm } from '@/components/dashboard/AddIncomeForm';
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm';
import { TransactionsView } from '@/components/dashboard/TransactionsView';
import { Plus, Eye, DollarSign } from 'lucide-react';

export default function FinancialData() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Financial Data Management"
          description="Add, track, and manage all your income and expenses"
          icon={<DollarSign className="w-6 h-6" />}
        />

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full md:max-w-md grid-cols-3">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">All Data</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Income</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </TabsTrigger>
          </TabsList>

          {/* All Transactions View */}
          <TabsContent value="transactions" className="mt-6">
            <TransactionsView />
          </TabsContent>

          {/* Add Income */}
          <TabsContent value="income" className="mt-6">
            <div className="max-w-2xl">
              <AddIncomeForm onSuccess={handleRefresh} />
            </div>
          </TabsContent>

          {/* Add Expense */}
          <TabsContent value="expense" className="mt-6">
            <div className="max-w-2xl">
              <AddExpenseForm onSuccess={handleRefresh} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
