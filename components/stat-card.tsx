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

const TONE_TILE: Record<StatTone, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  destructive:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  info: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
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
  featured?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  trend,
  featured = false,
  className,
}: StatCardProps) {
  if (featured) {
    return (
      <Card
        className={cn(
          "overflow-hidden border-0 bg-brand-deep text-primary-foreground shadow-md shadow-brand-deep/15",
          className,
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-primary-foreground/75">
              {label}
            </p>
            {Icon && (
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/12">
                <Icon className="size-4" />
              </span>
            )}
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          {(hint || trend) && (
            <p className="mt-2 text-xs text-primary-foreground/65">
              {trend?.label ?? hint}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-border/70 bg-card shadow-none",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-xl",
                TONE_TILE[tone],
              )}
            >
              <Icon className="size-4" />
            </span>
          )}
        </div>
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {(hint || trend) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {trend ? trend.label : hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
