import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { EmergencyFundCalculator } from '@/components/savings/EmergencyFundCalculator';
import { SavingsOverview } from '@/components/savings/SavingsOverview';
import { SavingsTips } from '@/components/savings/SavingsTips';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Target, Calculator } from 'lucide-react';

export default function Savings() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <PageHeader
          title="Savings Hub"
          description="Track your savings, calculate emergency funds, and reach your financial goals"
        />

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link to="/goals">
              <Target className="h-4 w-4 mr-2" />
              Manage Goals
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/calculators">
              <Calculator className="h-4 w-4 mr-2" />
              Financial Calculators
            </Link>
          </Button>
        </div>

        <SavingsOverview />
        
        <EmergencyFundCalculator />
        
        <SavingsTips />
      </div>
    </Layout>
  );
}
