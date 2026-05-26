import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "violet";

const TONE_STYLES: Record<StatTone, { tile: string; value?: string }> = {
  default: {
    tile: "bg-muted text-foreground",
  },
  primary: {
    tile: "bg-primary/15 text-primary",
  },
  success: {
    tile: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    tile: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  destructive: {
    tile: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
  info: {
    tile: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  },
  violet: {
    tile: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
};

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: StatTone;
  hint?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  trend,
  className,
}: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <CardContent className="flex items-start gap-4 p-5">
        {Icon && (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              styles.tile,
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tracking-tight md:text-3xl",
              styles.value,
            )}
          >
            {value}
          </p>
          {(hint || trend) && (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                    trend.direction === "up" &&
                      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
                    trend.direction === "down" &&
                      "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
                    trend.direction === "flat" && "bg-muted text-muted-foreground",
                  )}
                >
                  {trend.direction === "up" && "▲"}
                  {trend.direction === "down" && "▼"}
                  {trend.direction === "flat" && "▶"}
                  {trend.label}
                </span>
              )}
              {hint}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
