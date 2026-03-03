import { Calculator, TrendingUp, Landmark, CreditCard, PiggyBank } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoCard } from '@/components/ui/info-card';
import { SIPCalculator } from '@/components/calculators/SIPCalculator';
import { LumpsumCalculator } from '@/components/calculators/LumpsumCalculator';
import { EMICalculator } from '@/components/calculators/EMICalculator';
import { FDCalculator } from '@/components/calculators/FDCalculator';

export default function CalculatorsPage() {
  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Calculators"
          description="Plan your investments and loans with our financial calculators"
          icon={<Calculator className="w-6 h-6" />}
        />

        {/* What are Calculators Section */}
        <div className="mb-8">
          <InfoCard title="Financial Calculators" variant="info">
            <p>
              Use these calculators to plan your investments, estimate loan EMIs, 
              and understand how your money grows over time. Making informed 
              financial decisions starts with understanding the numbers.
            </p>
          </InfoCard>
        </div>

        <Tabs defaultValue="sip" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="sip"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3 border border-border"
            >
              <TrendingUp className="w-4 h-4" />
              SIP Calculator
            </TabsTrigger>
            <TabsTrigger
              value="lumpsum"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3 border border-border"
            >
              <PiggyBank className="w-4 h-4" />
              Lumpsum Calculator
            </TabsTrigger>
            <TabsTrigger
              value="emi"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3 border border-border"
            >
              <CreditCard className="w-4 h-4" />
              EMI Calculator
            </TabsTrigger>
            <TabsTrigger
              value="fd"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 py-3 border border-border"
            >
              <Landmark className="w-4 h-4" />
              FD Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sip" className="finance-card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">SIP Calculator</h2>
              <p className="text-muted-foreground">
                A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly 
                in mutual funds. Calculate how your investments can grow over time.
              </p>
            </div>
            <SIPCalculator />
          </TabsContent>

          <TabsContent value="lumpsum" className="finance-card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Lumpsum Calculator</h2>
              <p className="text-muted-foreground">
                Calculate returns on a one-time investment. Lumpsum investing is ideal when 
                you have a large amount to invest at once.
              </p>
            </div>
            <LumpsumCalculator />
          </TabsContent>

          <TabsContent value="emi" className="finance-card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">EMI Calculator</h2>
              <p className="text-muted-foreground">
                Equated Monthly Installment (EMI) is the fixed amount you pay monthly for a loan. 
                Plan your home, car, or personal loan with this calculator.
              </p>
            </div>
            <EMICalculator />
          </TabsContent>

          <TabsContent value="fd" className="finance-card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">FD Calculator</h2>
              <p className="text-muted-foreground">
                Fixed Deposits (FD) offer guaranteed returns at fixed interest rates. 
                Calculate your maturity amount based on deposit and tenure.
              </p>
            </div>
            <FDCalculator />
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <InfoCard title="💡 Power of Compounding" variant="tip">
            Start investing early! Due to compound interest, even small regular 
            investments can grow into substantial wealth over long periods.
          </InfoCard>
          <InfoCard title="⚠️ Consider Inflation" variant="warning">
            When planning long-term, remember that inflation reduces purchasing power. 
            Aim for returns that beat inflation (typically 6-7% in India).
          </InfoCard>
        </div>
      </div>
    </Layout>
  );
}
