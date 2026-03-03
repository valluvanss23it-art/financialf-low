import { Link } from "react-router-dom";
import {
  Plus,
  Minus,
  TrendingUp,
  Calculator,
  Target,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Add Income",
    icon: Plus,
    path: "/income",
    variant: "default" as const,
  },
  {
    label: "Add Expense",
    icon: Minus,
    path: "/expense",
    variant: "destructive" as const,
  },
  {
    label: "Invest",
    icon: TrendingUp,
    path: "/investments",
    variant: "secondary" as const,
  },
  {
    label: "Calculate",
    icon: Calculator,
    path: "/calculators",
    variant: "outline" as const,
  },
  {
    label: "Add Goal",
    icon: Target,
    path: "/goals",
    variant: "outline" as const,
  },
  {
    label: "Learn",
    icon: BookOpen,
    path: "/learn",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="finance-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            asChild
            className="h-auto py-4 flex-col gap-2"
          >
            <Link to={action.path}>
              <action.icon className="w-5 h-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
