import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewBars } from "@/components/dashboard/dash-widgets";

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
	return (
		<Card className="border-border/50 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div>
					<CardTitle className="text-base font-semibold">
						Post analytics
					</CardTitle>
					<p className="text-xs text-muted-foreground">By status</p>
				</div>
				<span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
					This account
				</span>
			</CardHeader>
			<CardContent>
				<OverviewBars
					items={[
						{ label: "Posted", value: posted, color: "bg-emerald-500/90" },
						{ label: "Review", value: inReview, color: "bg-amber-400" },
						{ label: "Payment", value: pendingPay, color: "bg-amber-400" },
						{ label: "Rejected", value: rejected, color: "bg-rose-400/90" },
					]}
				/>
			</CardContent>
		</Card>
	);
}
