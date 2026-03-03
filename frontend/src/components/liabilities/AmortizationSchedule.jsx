import { useMemo } from 'react';
import { format, addMonths } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AmortizationScheduleProps {
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  outstandingBalance: number;
}

interface ScheduleRow {
  month: number;
  date: string;
  openingBalance: number;
  emiAmount: number;
  principalComponent: number;
  interestComponent: number;
  closingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

export function AmortizationSchedule({
  principalAmount,
  interestRate,
  tenureMonths,
  emiAmount,
  startDate,
  outstandingBalance,
}: AmortizationScheduleProps) {
  const schedule = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const rows: ScheduleRow[] = [];
    let balance = principalAmount;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    const start = new Date(startDate);

    for (let month = 1; month <= tenureMonths; month++) {
      const interestComponent = balance * monthlyRate;
      const principalComponent = emiAmount - interestComponent;
      const closingBalance = Math.max(0, balance - principalComponent);
      
      cumulativePrincipal += principalComponent;
      cumulativeInterest += interestComponent;

      rows.push({
        month,
        date: format(addMonths(start, month - 1), 'MMM yyyy'),
        openingBalance: balance,
        emiAmount,
        principalComponent,
        interestComponent,
        closingBalance,
        cumulativePrincipal,
        cumulativeInterest,
      });

      balance = closingBalance;
    }

    return rows;
  }, [principalAmount, interestRate, tenureMonths, emiAmount, startDate]);

  // Find current month based on outstanding balance
  const currentMonthIndex = useMemo(() => {
    for (let i = 0; i < schedule.length; i++) {
      if (Math.abs(schedule[i].closingBalance - outstandingBalance) < 100) {
        return i;
      }
    }
    return -1;
  }, [schedule, outstandingBalance]);

  // Chart data - show yearly summary
  const chartData = useMemo(() => {
    const yearlyData: { year: string; principal: number; interest: number; balance: number }[] = [];
    
    for (let i = 0; i < schedule.length; i += 12) {
      const yearEnd = Math.min(i + 11, schedule.length - 1);
      const yearNumber = Math.floor(i / 12) + 1;
      
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      
      for (let j = i; j <= yearEnd; j++) {
        yearlyPrincipal += schedule[j].principalComponent;
        yearlyInterest += schedule[j].interestComponent;
      }
      
      yearlyData.push({
        year: `Y${yearNumber}`,
        principal: Math.round(yearlyPrincipal),
        interest: Math.round(yearlyInterest),
        balance: Math.round(schedule[yearEnd].closingBalance),
      });
    }
    
    return yearlyData;
  }, [schedule]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
  const totalAmount = principalAmount + totalInterest;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-3 rounded-lg bg-primary/10">
          <p className="text-xs text-muted-foreground">Principal</p>
          <p className="text-sm font-bold text-primary">{formatCurrency(principalAmount)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-destructive/10">
          <p className="text-xs text-muted-foreground">Total Interest</p>
          <p className="text-sm font-bold text-destructive">{formatCurrency(totalInterest)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-secondary/10">
          <p className="text-xs text-muted-foreground">Total Payable</p>
          <p className="text-sm font-bold text-foreground">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-accent/10">
          <p className="text-xs text-muted-foreground">Monthly EMI</p>
          <p className="text-sm font-bold text-foreground">{formatCurrency(emiAmount)}</p>
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="table">Detailed Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'principal' ? 'Principal Paid' : name === 'interest' ? 'Interest Paid' : 'Balance',
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="principal"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  name="Principal"
                />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stackId="1"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.6}
                  name="Interest"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Balance Trend */}
          <div className="h-[150px]">
            <p className="text-sm font-medium mb-2 text-muted-foreground">Outstanding Balance Over Time</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Balance']}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="table">
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[60px]">Month</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">EMI</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Closing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((row) => (
                  <TableRow
                    key={row.month}
                    className={row.month === currentMonthIndex + 1 ? 'bg-primary/10' : ''}
                  >
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(row.openingBalance)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.emiAmount)}
                    </TableCell>
                    <TableCell className="text-right text-primary">
                      {formatCurrency(row.principalComponent)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {formatCurrency(row.interestComponent)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.closingBalance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
