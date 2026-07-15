import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashPanel({
	title,
	description,
	action,
	children,
	className,
	contentClassName,
}: {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
}) {
	return (
		<Card
			className={cn(
				"overflow-hidden border-border/50 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
				className,
			)}
		>
			{(title || action) && (
				<CardHeader className="flex flex-row items-start justify-between space-y-0 border-b border-border/40 px-5 py-4">
					<div className="min-w-0">
						{title && (
							<CardTitle className="text-[15px] font-semibold tracking-tight">
								{title}
							</CardTitle>
						)}
						{description && (
							<p className="mt-0.5 text-xs text-muted-foreground">
								{description}
							</p>
						)}
					</div>
					{action}
				</CardHeader>
			)}
			<CardContent className={cn("p-5", contentClassName)}>{children}</CardContent>
		</Card>
	);
}

type KpiTone = "default" | "success" | "warning" | "danger" | "info";

const TONE: Record<KpiTone, string> = {
	default: "bg-muted text-foreground",
	success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
	warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
	danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
	info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

export function KpiCard({
	label,
	value,
	hint,
	delta,
	deltaTone = "success",
	icon: Icon,
	tone = "default",
	className,
}: {
	label: string;
	value: string | number;
	hint?: string;
	delta?: string;
	deltaTone?: "success" | "danger" | "muted";
	icon?: React.ComponentType<{ className?: string }>;
	tone?: KpiTone;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-border/50 bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<p className="text-sm text-muted-foreground">{label}</p>
				{Icon && (
					<span
						className={cn(
							"flex size-9 items-center justify-center rounded-xl",
							TONE[tone],
						)}
					>
						<Icon className="size-4" />
					</span>
				)}
			</div>
			<p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
				{value}
			</p>
			{(delta || hint) && (
				<p className="mt-2 text-xs">
					{delta && (
						<span
							className={cn(
								"font-medium",
								deltaTone === "success" && "text-emerald-600 dark:text-emerald-400",
								deltaTone === "danger" && "text-rose-600 dark:text-rose-400",
								deltaTone === "muted" && "text-muted-foreground",
							)}
						>
							{delta}
						</span>
					)}
					{delta && hint ? (
						<span className="text-muted-foreground"> · {hint}</span>
					) : (
						hint && <span className="text-muted-foreground">{hint}</span>
					)}
				</p>
			)}
		</div>
	);
}

export function OverviewBars({
	items,
}: {
	items: { label: string; value: number; color?: string }[];
}) {
	const max = Math.max(...items.map((i) => i.value), 1);

	return (
		<div className="flex h-[220px] items-end gap-3 sm:gap-4">
			{items.map((item) => {
				const pct = Math.max(8, (item.value / max) * 100);
				return (
					<div
						key={item.label}
						className="flex h-full min-w-0 flex-1 flex-col items-center"
					>
						<span className="mb-2 text-xs font-semibold tabular-nums text-foreground">
							{item.value}
						</span>
						<div className="flex w-full flex-1 items-end justify-center">
							<div
								className={cn(
									"w-full max-w-[52px] rounded-t-2xl bg-primary/90 transition-all",
									item.color,
								)}
								style={{ height: `${pct}%` }}
							/>
						</div>
						<span className="mt-2 truncate text-center text-[11px] font-medium text-muted-foreground">
							{item.label}
						</span>
					</div>
				);
			})}
		</div>
	);
}

export function SegmentedBar({
	segments,
}: {
	segments: { label: string; value: number; className: string }[];
}) {
	const total = segments.reduce((s, x) => s + x.value, 0) || 1;

	return (
		<div className="space-y-3">
			<div className="flex h-3 overflow-hidden rounded-full bg-muted">
				{segments.map((seg) => (
					<div
						key={seg.label}
						className={cn("h-full", seg.className)}
						style={{ width: `${(seg.value / total) * 100}%` }}
						title={`${seg.label}: ${seg.value}`}
					/>
				))}
			</div>
			<div className="grid gap-2 sm:grid-cols-2">
				{segments.map((seg) => (
					<div
						key={seg.label}
						className="flex items-center justify-between gap-2 text-xs"
					>
						<span className="flex items-center gap-2 text-muted-foreground">
							<span className={cn("size-2.5 rounded-full", seg.className)} />
							{seg.label}
						</span>
						<span className="font-medium tabular-nums">
							{Math.round((seg.value / total) * 100)}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function ProgressMeter({
	value,
	label,
	sublabel,
}: {
	value: number;
	label: string;
	sublabel?: string;
}) {
	const clamped = Math.max(0, Math.min(100, value));
	const r = 54;
	const c = 2 * Math.PI * r;
	const offset = c - (clamped / 100) * c;

	return (
		<div className="flex flex-col items-center text-center">
			<div className="relative size-36">
				<svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden>
					<circle
						cx="64"
						cy="64"
						r={r}
						fill="none"
						stroke="currentColor"
						strokeWidth="12"
						className="text-muted"
					/>
					<circle
						cx="64"
						cy="64"
						r={r}
						fill="none"
						stroke="currentColor"
						strokeWidth="12"
						strokeLinecap="round"
						strokeDasharray={c}
						strokeDashoffset={offset}
						className="text-primary transition-all"
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-2xl font-semibold tabular-nums">{clamped}%</span>
				</div>
			</div>
			<p className="mt-3 text-sm font-medium">{label}</p>
			{sublabel && (
				<p className="mt-1 max-w-56 text-xs text-muted-foreground">
					{sublabel}
				</p>
			)}
		</div>
	);
}

export function GoalRow({
	label,
	current,
	total,
	hint,
}: {
	label: string;
	current: number;
	total: number;
	hint?: string;
}) {
	const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-3 text-sm">
				<span className="font-medium">{label}</span>
				<span className="tabular-nums text-muted-foreground">
					{current}/{total}
				</span>
			</div>
			<div className="h-2 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-primary transition-all"
					style={{ width: `${pct}%` }}
				/>
			</div>
			{hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
		</div>
	);
}
