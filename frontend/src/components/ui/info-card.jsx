import { ReactNode } from "react";
import { Info, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoCardVariant = "info" | "warning" | "success" | "tip";

interface InfoCardProps {
  title: string;
  children: ReactNode;
  variant?: InfoCardVariant;
  className?: string;
}

const variantConfig: Record<
  InfoCardVariant,
  { icon: typeof Info; bgClass: string; borderClass: string; iconClass: string }
> = {
  info: {
    icon: Info,
    bgClass: "bg-info/5",
    borderClass: "border-info/20",
    iconClass: "text-info",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-warning/5",
    borderClass: "border-warning/20",
    iconClass: "text-warning",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-success/5",
    borderClass: "border-success/20",
    iconClass: "text-success",
  },
  tip: {
    icon: Lightbulb,
    bgClass: "bg-accent/10",
    borderClass: "border-accent/30",
    iconClass: "text-accent",
  },
};

export function InfoCard({
  title,
  children,
  variant = "info",
  className,
}: InfoCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconClass)} />
        <div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
