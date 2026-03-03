import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, PiggyBank, TrendingUp, Shield, Target, Wallet } from 'lucide-react';

const tips = [
  {
    icon: PiggyBank,
    title: '50/30/20 Rule',
    description: 'Allocate 50% to needs, 30% to wants, and 20% to savings for balanced finances.'
  },
  {
    icon: Shield,
    title: 'Emergency First',
    description: 'Build 3-6 months of expenses in emergency fund before other investments.'
  },
  {
    icon: TrendingUp,
    title: 'Automate Savings',
    description: 'Set up automatic transfers to savings on payday to ensure consistency.'
  },
  {
    icon: Target,
    title: 'Specific Goals',
    description: 'Name your goals specifically (e.g., "Goa Trip 2025") for better motivation.'
  },
  {
    icon: Wallet,
    title: 'Track Everything',
    description: 'Monitor all expenses to identify areas where you can save more.'
  },
  {
    icon: Lightbulb,
    title: 'Start Small',
    description: 'Even ₹500/month adds up. Consistency matters more than amount.'
  }
];

export function SavingsTips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Smart Saving Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
