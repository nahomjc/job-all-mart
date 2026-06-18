import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
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
  primary: "bg-primary/12 text-primary",
  success: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  destructive:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
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
          "overflow-hidden border-0 bg-brand-deep text-primary-foreground shadow-lg shadow-brand-deep/20",
          className,
        )}
      >
        <CardContent className="relative p-5">
          {Icon && (
            <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/15">
              <Icon className="size-4" />
            </span>
          )}
          <p className="text-sm font-medium text-primary-foreground/80">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {(hint || trend) && (
            <p className="mt-2 text-xs text-primary-foreground/70">
              {trend?.label ?? hint}
            </p>
          )}
          <span className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/10">
            <ArrowUpRight className="size-4" />
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <CardContent className="relative p-5">
        {Icon && (
          <span
            className={cn(
              "absolute right-4 top-4 flex size-9 items-center justify-center rounded-full",
              TONE_TILE[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
        <p className="pr-12 text-sm font-medium text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        {(hint || trend) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  trend.direction === "up" && "text-sky-600",
                  trend.direction === "down" && "text-rose-600",
                )}
              >
                {trend.direction === "up" && "↑ "}
                {trend.direction === "down" && "↓ "}
                {trend.label}
              </span>
            )}
            {!trend && hint}
          </p>
        )}
        <span className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-full border bg-background">
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </span>
      </CardContent>
    </Card>
  );
}
