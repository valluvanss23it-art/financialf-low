import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

type Expense = any;

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--accent))',
  'hsl(160, 60%, 45%)',
  'hsl(280, 60%, 50%)',
  'hsl(30, 80%, 50%)',
  'hsl(200, 70%, 50%)',
];

const categoryLabels: Record<string, string> = {
  food: '🍔 Food',
  transport: '🚗 Transport',
  utilities: '💡 Utilities',
  rent: '🏠 Rent',
  healthcare: '🏥 Healthcare',
  education: '📚 Education',
  entertainment: '🎬 Entertainment',
  shopping: '🛍️ Shopping',
  insurance: '🛡️ Insurance',
  subscriptions: '📱 Subscriptions',
  travel: '✈️ Travel',
  personal_care: '💅 Personal Care',
  household: '🏡 Household',
  gifts: '🎁 Gifts',
  investments: '📈 Investments',
  taxes: '📋 Taxes',
  other: '📝 Other',
};

interface ExpenseCategoryChartProps {
  expenses: Expense[];
}

export function ExpenseCategoryChart({ expenses }: ExpenseCategoryChartProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .map(([category, value]) => ({
      name: categoryLabels[category] || category,
      value,
      category,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (expenses.length === 0) {
    return (
      <div className="finance-card h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">No expense data to display</p>
      </div>
    );
  }

  return (
    <div className="finance-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Spending by Category
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
