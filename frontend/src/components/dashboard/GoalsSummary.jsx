import { Link } from "react-router-dom";
import { Target, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GoalSummary {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  priority: string;
  category: string;
}

interface GoalsSummaryProps {
  goals: GoalSummary[];
  loading?: boolean;
}

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  low: "bg-muted text-muted-foreground border-muted",
};

export function GoalsSummary({ goals, loading }: GoalsSummaryProps) {
  if (loading) {
    return (
      <div className="finance-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="finance-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Active Goals</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/goals" className="text-primary hover:text-primary/80">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No active goals yet</p>
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link to="/goals">Create a Goal</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-sm truncate max-w-[60%]">
                  {goal.name}
                </span>
                <Badge
                  variant="outline"
                  className={priorityColors[goal.priority] || priorityColors.medium}
                >
                  {goal.priority}
                </Badge>
              </div>
              <Progress value={goal.progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>₹{goal.current_amount.toLocaleString("en-IN")}</span>
                <span>{goal.progress}% of ₹{goal.target_amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
