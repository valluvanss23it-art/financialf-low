import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatCardVariant =
  | "income"
  | "expense"
  | "savings"
  | "investment"
  | "asset"
  | "liability"
  | "neutral";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: StatCardVariant;
  trend?: {
    value: number;
    label?: string;
  };
  subtitle?: string;
  className?: string;
  formatAsCurrency?: boolean;
}

const variantStyles: Record<StatCardVariant, string> = {
  income: "stat-card-income",
  expense: "stat-card-expense",
  savings: "stat-card-savings",
  investment: "stat-card-investment",
  asset: "stat-card-asset",
  liability: "stat-card-liability",
  neutral: "stat-card-neutral",
};

const iconBgStyles: Record<StatCardVariant, string> = {
  income: "bg-success/10 text-success",
  expense: "bg-destructive/10 text-destructive",
  savings: "bg-primary/10 text-primary",
  investment: "bg-secondary/10 text-secondary",
  asset: "bg-info/10 text-info",
  liability: "bg-warning/10 text-warning",
  neutral: "bg-muted text-muted-foreground",
};

export function StatCard({
  title,
  value,
  icon,
  variant = "neutral",
  trend,
  subtitle,
  className,
  formatAsCurrency = true,
}: StatCardProps) {
  const formattedValue =
    typeof value === "number" && formatAsCurrency
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(value)
      : value;

  return (
    <div className={cn("stat-card", variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold text-foreground">
            {formattedValue}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgStyles[variant])}>{icon}</div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
          {trend.value > 0 ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : trend.value < 0 ? (
            <TrendingDown className="w-4 h-4 text-destructive" />
          ) : (
            <Minus className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              trend.value > 0
                ? "text-success"
                : trend.value < 0
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
