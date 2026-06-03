import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LABELS = ["Posted", "In review", "Pending pay", "Rejected"] as const;

type StatusChartProps = {
	posted: number;
	inReview: number;
	pendingPay: number;
	rejected: number;
};

export function StatusChart({
	posted,
	inReview,
	pendingPay,
	rejected,
}: StatusChartProps) {
	const values = [posted, inReview, pendingPay, rejected];
	const max = Math.max(...values, 1);

	const heights = [0.92, 0.72, 0.55, 0.38].map((h, i) =>
		Math.max(12, (values[i] / max) * h * 100),
	);

	return (
		<Card className="border-border/60 shadow-sm">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle className="text-base font-semibold">
						Post analytics
					</CardTitle>
					<p className="text-xs text-muted-foreground">By status</p>
				</div>
				<span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
					This account
				</span>
			</CardHeader>
			<CardContent>
				<div className="flex h-40 items-end justify-between gap-2 px-1 pt-2">
					{LABELS.map((label, i) => (
						<div
							key={label}
							className="flex flex-1 flex-col items-center gap-2"
						>
							<div
								className="w-full max-w-[42px] rounded-t-lg bg-primary transition-all"
								style={{
									height: `${heights[i]}%`,
									opacity: 0.45 + i * 0.18,
								}}
							/>
							<span className="text-[10px] font-medium text-muted-foreground">
								{label.split(" ")[0]}
							</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
