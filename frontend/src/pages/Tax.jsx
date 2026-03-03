import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Calculator,
  FileText,
  Building2,
  Home,
  Heart,
  GraduationCap,
  Landmark,
  PiggyBank,
  TrendingUp,
  HelpCircle,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const oldRegimeSlabs = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const newRegimeSlabs = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const deductions = [
  { id: '80c', label: 'Section 80C', max: 150000, icon: PiggyBank, description: 'PPF, ELSS, LIC, EPF, NSC, Tax-saving FD' },
  { id: '80d', label: 'Section 80D', max: 75000, icon: Heart, description: 'Health Insurance Premium' },
  { id: '80e', label: 'Section 80E', max: Infinity, icon: GraduationCap, description: 'Education Loan Interest' },
  { id: '80g', label: 'Section 80G', max: Infinity, icon: Landmark, description: 'Donations to Charity' },
  { id: 'hra', label: 'HRA Exemption', max: Infinity, icon: Home, description: 'House Rent Allowance' },
  { id: '80ccd', label: 'Section 80CCD(1B)', max: 50000, icon: TrendingUp, description: 'NPS Additional Contribution' },
];

const taxTips = [
  {
    title: 'Plan 80C early',
    description: 'Spread investments across the year to avoid last‑minute, sub‑optimal choices.',
  },
  {
    title: 'Use NPS extra ₹50,000',
    description: 'Claim Section 80CCD(1B) on top of 80C for additional tax savings.',
  },
  {
    title: 'Keep rent receipts & HRA docs',
    description: 'Maintain proofs for HRA exemption and landlord PAN when required.',
  },
  {
    title: 'Health insurance matters',
    description: 'Section 80D can cover self, family, and parents—higher limits for seniors.',
  },
];

export default function TaxPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [deductionValues, setDeductionValues] = useState<Record<string, number>>({
    '80c': 150000,
    '80d': 25000,
    '80e': 0,
    '80g': 0,
    'hra': 0,
    '80ccd': 50000,
  });

  const calculateTax = (income: number, slabs: typeof oldRegimeSlabs) => {
    let tax = 0;
    let remaining = income;

    for (const slab of slabs) {
      if (remaining <= 0) break;
      const taxableInSlab = Math.min(remaining, slab.max - slab.min);
      tax += taxableInSlab * (slab.rate / 100);
      remaining -= taxableInSlab;
    }

    // Add 4% cess
    const cess = tax * 0.04;
    return { tax, cess, total: tax + cess };
  };

  const totalDeductions = Object.values(deductionValues).reduce((sum, val) => sum + val, 0);
  const standardDeduction = 50000;

  // Old Regime: Income - Standard Deduction - All Deductions
  const taxableIncomeOld = Math.max(0, grossIncome - standardDeduction - totalDeductions);
  const oldRegimeTax = calculateTax(taxableIncomeOld, oldRegimeSlabs);

  // New Regime: Income - Standard Deduction only (no other deductions)
  const taxableIncomeNew = Math.max(0, grossIncome - standardDeduction);
  const newRegimeTax = calculateTax(taxableIncomeNew, newRegimeSlabs);

  // Apply rebate under section 87A for new regime (if taxable income <= 7L, tax = 0)
  const finalNewRegimeTax = taxableIncomeNew <= 700000 ? { tax: 0, cess: 0, total: 0 } : newRegimeTax;

  const betterRegime = finalNewRegimeTax.total < oldRegimeTax.total ? 'new' : 'old';
  const taxSavings = Math.abs(finalNewRegimeTax.total - oldRegimeTax.total);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Tax Planning"
          description="Calculate taxes, compare regimes, and maximize your savings"
          icon={<Receipt className="w-6 h-6" />}
        />

        <div className="mb-8">
          <InfoCard title="Why Tax Planning Matters?" variant="info">
            <p>
              Smart tax planning helps you legally minimize your tax liability and maximize savings.
              India offers two tax regimes - choose the one that benefits you most based on your
              deductions and income level.
            </p>
          </InfoCard>
        </div>

        {/* Tax Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Gross Income"
            value={grossIncome}
            icon={<IndianRupee className="w-5 h-5" />}
            variant="income"
          />
          <StatCard
            title="Old Regime Tax"
            value={oldRegimeTax.total}
            icon={<FileText className="w-5 h-5" />}
            variant={betterRegime === 'old' ? 'savings' : 'expense'}
            subtitle={betterRegime === 'old' ? '✓ Better for you' : ''}
          />
          <StatCard
            title="New Regime Tax"
            value={finalNewRegimeTax.total}
            icon={<FileText className="w-5 h-5" />}
            variant={betterRegime === 'new' ? 'savings' : 'expense'}
            subtitle={betterRegime === 'new' ? '✓ Better for you' : ''}
          />
          <StatCard
            title="Potential Savings"
            value={taxSavings}
            icon={<PiggyBank className="w-5 h-5" />}
            variant="savings"
            subtitle={`Choose ${betterRegime} regime`}
          />
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
            <TabsTrigger value="deductions">Deductions Guide</TabsTrigger>
            <TabsTrigger value="slabs">Tax Slabs</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Input */}
              <div className="finance-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Enter Your Details
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Annual Gross Income</Label>
                    <Input
                      type="number"
                      value={grossIncome}
                      onChange={(e) => setGrossIncome(Number(e.target.value))}
                      placeholder="Enter your annual income"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax Regime for Comparison</Label>
                    <Select value={regime} onValueChange={(val: 'old' | 'new') => setRegime(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Regime (Default)</SelectItem>
                        <SelectItem value="old">Old Regime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Standard Deduction (Auto-applied)</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(standardDeduction)}</p>
                  </div>
                </div>
              </div>

              {/* Deductions Input (for Old Regime) */}
              <div className="finance-card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Deductions (Old Regime Only)
                </h3>
                
                <div className="space-y-3">
                  {deductions.map((ded) => (
                    <div key={ded.id} className="flex items-center gap-3">
                      <ded.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm">{ded.label}</Label>
                        <p className="text-xs text-muted-foreground truncate">
                          Max: {ded.max === Infinity ? 'No limit' : formatCurrency(ded.max)}
                        </p>
                      </div>
                      <Input
                        type="number"
                        value={deductionValues[ded.id]}
                        onChange={(e) => setDeductionValues({
                          ...deductionValues,
                          [ded.id]: Math.min(Number(e.target.value), ded.max)
                        })}
                        className="w-28"
                      />
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="font-medium">Total Deductions</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`finance-card ${betterRegime === 'old' ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Old Regime</h3>
                  {betterRegime === 'old' && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Income</span>
                    <span>{formatCurrency(grossIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Deduction</span>
                    <span className="text-primary">-{formatCurrency(standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other Deductions</span>
                    <span className="text-primary">-{formatCurrency(totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(taxableIncomeOld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Tax</span>
                    <span>{formatCurrency(oldRegimeTax.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health & Education Cess (4%)</span>
                    <span>{formatCurrency(oldRegimeTax.cess)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold">Total Tax Payable</span>
                    <span className="font-bold text-destructive">{formatCurrency(oldRegimeTax.total)}</span>
                  </div>
                </div>
              </div>

              <div className={`finance-card ${betterRegime === 'new' ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">New Regime</h3>
                  {betterRegime === 'new' && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Income</span>
                    <span>{formatCurrency(grossIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard Deduction</span>
                    <span className="text-primary">-{formatCurrency(standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground/50">
                    <span>Other Deductions</span>
                    <span>Not Applicable</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(taxableIncomeNew)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Tax</span>
                    <span>{formatCurrency(finalNewRegimeTax.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health & Education Cess (4%)</span>
                    <span>{formatCurrency(finalNewRegimeTax.cess)}</span>
                  </div>
                  {taxableIncomeNew <= 700000 && (
                    <div className="flex justify-between text-success">
                      <span>Rebate u/s 87A</span>
                      <span>Full tax rebate!</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold">Total Tax Payable</span>
                    <span className="font-bold text-destructive">{formatCurrency(finalNewRegimeTax.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-6">
            <div className="finance-card">
              <h3 className="text-lg font-semibold mb-4">Popular Tax Deductions</h3>
              
              <Accordion type="single" collapsible className="w-full">
                {deductions.map((ded) => (
                  <AccordionItem key={ded.id} value={ded.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ded.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{ded.label}</p>
                          <p className="text-sm text-muted-foreground">
                            Max: {ded.max === Infinity ? 'No limit' : formatCurrency(ded.max)}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <p className="text-muted-foreground">{ded.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard title="💡 Maximize 80C" variant="tip">
                Invest in ELSS mutual funds for tax saving with potential for higher returns compared to traditional options like PPF or FD.
              </InfoCard>
              <InfoCard title="🏥 Don't Forget 80D" variant="tip">
                Buy health insurance for yourself and parents to claim up to ₹75,000 deduction (₹25K self + ₹50K senior citizen parents).
              </InfoCard>
            </div>

            <div className="finance-card">
              <h3 className="text-lg font-semibold mb-4">Quick Tax Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taxTips.map((tip) => (
                  <InfoCard key={tip.title} title={tip.title} variant="info">
                    {tip.description}
                  </InfoCard>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="slabs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="finance-card">
                <h3 className="text-lg font-semibold mb-4">Old Tax Regime (FY 2024-25)</h3>
                <div className="space-y-2">
                  {oldRegimeSlabs.map((slab, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">
                        {slab.max === Infinity
                          ? `Above ${formatCurrency(slab.min)}`
                          : `${formatCurrency(slab.min)} - ${formatCurrency(slab.max)}`}
                      </span>
                      <span className="font-medium text-primary">{slab.rate}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  + 4% Health & Education Cess on total tax
                </p>
              </div>

              <div className="finance-card">
                <h3 className="text-lg font-semibold mb-4">New Tax Regime (FY 2024-25)</h3>
                <div className="space-y-2">
                  {newRegimeSlabs.map((slab, i) => (
                    <div key={i} className="flex justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">
                        {slab.max === Infinity
                          ? `Above ${formatCurrency(slab.min)}`
                          : `${formatCurrency(slab.min)} - ${formatCurrency(slab.max)}`}
                      </span>
                      <span className="font-medium text-primary">{slab.rate}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  + 4% Health & Education Cess | Rebate u/s 87A if income ≤ ₹7L
                </p>
              </div>
            </div>

            <InfoCard title="Which Regime Should I Choose?" variant="info">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>New Regime:</strong> Better if you don't have significant deductions (below ₹3-4L)</li>
                <li><strong>Old Regime:</strong> Better if you have home loan, HRA, and max out 80C/80D</li>
                <li>Use the calculator above to compare your actual tax liability</li>
              </ul>
            </InfoCard>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
