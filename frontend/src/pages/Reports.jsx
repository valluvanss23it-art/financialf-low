import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { incomeAPI, expensesAPI, assetsAPI, liabilitiesAPI, insuranceAPI, goalsAPI } from '@/lib/api';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<string>('comprehensive');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchAllData = async () => {
    try {
      const [incomeRes, expenseRes, assetsRes, liabilitiesRes, insuranceRes, goalsRes] = await Promise.all([
        incomeAPI.getAll(),
        expensesAPI.getAll(),
        assetsAPI.getAll(),
        liabilitiesAPI.getAll(),
        insuranceAPI.getAll(),
        goalsAPI.getAll(),
      ]);

      return {
        incomes: incomeRes.data.data || [],
        expenses: expenseRes.data.data || [],
        assets: assetsRes.data.data || [],
        liabilities: liabilitiesRes.data.data || [],
        insurance: insuranceRes.data.data || [],
        goals: goalsRes.data.data || [],
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const filterByDateRange = (items: any[], dateField: string = 'date') => {
    if (dateRange === 'all') return items;

    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return items;
    }

    return items.filter((item) => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= now;
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const data = await fetchAllData();
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('financeflow Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 33);

      let yPosition = 45;

      // Financial Summary
      if (reportType === 'comprehensive' || reportType === 'summary') {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Financial Summary', 14, yPosition);
        yPosition += 8;

        const totalIncome = data.incomes.reduce((sum, i) => sum + Number(i.amount), 0);
        const totalExpenses = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalAssets = data.assets.reduce((sum, a) => sum + Number(a.current_value), 0);
        const totalLiabilities = data.liabilities.reduce((sum, l) => sum + Number(l.outstanding_balance), 0);
        const netWorth = totalAssets - totalLiabilities;

        const summaryData = [
          ['Total Income', `₹${totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
          ['Total Expenses', `₹${totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
          ['Savings', `₹${(totalIncome - totalExpenses).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
          ['Total Assets', `₹${totalAssets.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
          ['Total Liabilities', `₹${totalLiabilities.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
          ['Net Worth', `₹${netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: summaryData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Income Report
      if (reportType === 'comprehensive' || reportType === 'income') {
        const filteredIncomes = filterByDateRange(data.incomes);

        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Income Details', 14, yPosition);
        yPosition += 8;

        if (filteredIncomes.length > 0) {
          const incomeData = filteredIncomes.map((income) => [
            new Date(income.date).toLocaleDateString(),
            income.source || '-',
            income.category || '-',
            `₹${Number(income.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Date', 'Source', 'Category', 'Amount']],
            body: incomeData,
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94] },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No income records found.', 14, yPosition);
          yPosition += 15;
        }
      }

      // Expense Report
      if (reportType === 'comprehensive' || reportType === 'expenses') {
        const filteredExpenses = filterByDateRange(data.expenses);

        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Expense Details', 14, yPosition);
        yPosition += 8;

        if (filteredExpenses.length > 0) {
          const expenseData = filteredExpenses.map((expense) => [
            new Date(expense.date).toLocaleDateString(),
            expense.merchant || '-',
            expense.category || '-',
            `₹${Number(expense.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Date', 'Merchant', 'Category', 'Amount']],
            body: expenseData,
            theme: 'grid',
            headStyles: { fillColor: [239, 68, 68] },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No expense records found.', 14, yPosition);
          yPosition += 15;
        }
      }

      // Assets Report
      if (reportType === 'comprehensive' || reportType === 'assets') {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Assets Details', 14, yPosition);
        yPosition += 8;

        if (data.assets.length > 0) {
          const assetData = data.assets.map((asset) => [
            asset.name || '-',
            asset.type || '-',
            `₹${Number(asset.current_value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '-',
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Type', 'Current Value', 'Purchase Date']],
            body: assetData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No assets found.', 14, yPosition);
          yPosition += 15;
        }
      }

      // Liabilities Report
      if (reportType === 'comprehensive' || reportType === 'liabilities') {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Liabilities Details', 14, yPosition);
        yPosition += 8;

        if (data.liabilities.length > 0) {
          const liabilityData = data.liabilities.map((liability) => [
            liability.name || '-',
            liability.type || '-',
            `₹${Number(liability.outstanding_balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            `${Number(liability.interest_rate)}%`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Type', 'Outstanding', 'Interest Rate']],
            body: liabilityData,
            theme: 'grid',
            headStyles: { fillColor: [249, 115, 22] },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No liabilities found.', 14, yPosition);
          yPosition += 15;
        }
      }

      // Goals Report
      if (reportType === 'comprehensive' || reportType === 'goals') {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Goals Details', 14, yPosition);
        yPosition += 8;

        if (data.goals.length > 0) {
          const goalsData = data.goals.map((goal) => [
            goal.name || '-',
            goal.category || '-',
            `₹${Number(goal.current_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            `₹${Number(goal.target_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            `${Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)}%`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Category', 'Current', 'Target', 'Progress']],
            body: goalsData,
            theme: 'grid',
            headStyles: { fillColor: [168, 85, 247] },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No goals found.', 14, yPosition);
          yPosition += 15;
        }
      }

      // Insurance Report
      if (reportType === 'comprehensive' || reportType === 'insurance') {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Insurance Policies', 14, yPosition);
        yPosition += 8;

        if (data.insurance.length > 0) {
          const insuranceData = data.insurance.map((policy) => [
            policy.name || '-',
            policy.type || '-',
            policy.provider || '-',
            `₹${Number(policy.coverage_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
            `₹${Number(policy.premium_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Name', 'Type', 'Provider', 'Coverage', 'Premium']],
            body: insuranceData,
            theme: 'grid',
            headStyles: { fillColor: [20, 184, 166] },
          });
        } else {
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('No insurance policies found.', 14, yPosition);
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} | financeflow © ${new Date().getFullYear()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <PageHeader
          title="Reports"
          description="Generate and download comprehensive financial reports"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Comprehensive Report
              </CardTitle>
              <CardDescription>Complete financial overview with all data</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Income Report
              </CardTitle>
              <CardDescription>Detailed breakdown of all income sources</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-red-500" />
                Expense Report
              </CardTitle>
              <CardDescription>Detailed breakdown of all expenses</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Assets & Liabilities
              </CardTitle>
              <CardDescription>Overview of assets and liabilities</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Goals Report
              </CardTitle>
              <CardDescription>Progress tracking for financial goals</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-500" />
                Insurance Report
              </CardTitle>
              <CardDescription>Summary of all insurance policies</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Custom Report</CardTitle>
            <CardDescription>Select report type and date range to generate a PDF report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    <SelectItem value="summary">Financial Summary</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                    <SelectItem value="expenses">Expenses Only</SelectItem>
                    <SelectItem value="assets">Assets Only</SelectItem>
                    <SelectItem value="liabilities">Liabilities Only</SelectItem>
                    <SelectItem value="goals">Goals Only</SelectItem>
                    <SelectItem value="insurance">Insurance Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="dateRange">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full md:w-auto"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

