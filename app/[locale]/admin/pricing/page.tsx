import { Tags } from "lucide-react";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { PricingPlanCreateDrawer } from "@/components/admin/pricing-plan-create-drawer";
import { PricingPlanEditDialog } from "@/components/admin/pricing-plan-edit-dialog";
import { pricingPlanRepo } from "@/server/repositories/pricing-plan";

export const metadata = { title: "Pricing plans" };

export default async function AdminPricingPage() {
	const rows = await pricingPlanRepo.listAll();

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Site"
				title="Pricing plans"
				description="These cards appear on the public /pricing page. Set the price label, features, and CTA for each plan."
				actions={<PricingPlanCreateDrawer />}
			/>

			<Card>
				<CardContent className="p-0">
					{rows.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
							<span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Tags className="size-6" />
							</span>
							<p className="text-sm text-muted-foreground">
								No plans yet. Click &quot;New price&quot; to add one.
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/40 hover:bg-muted/40">
									<TableHead>Name</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Sort</TableHead>
									<TableHead>Featured</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((plan) => (
									<TableRow key={plan.id}>
										<TableCell className="font-medium">{plan.name}</TableCell>
										<TableCell>
											{plan.priceLabel}
											{plan.cadence ? (
												<span className="text-muted-foreground">
													{" "}
													{plan.cadence}
												</span>
											) : null}
										</TableCell>
										<TableCell>{plan.sortOrder}</TableCell>
										<TableCell>
											{plan.highlight ? (
												<Badge>featured</Badge>
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</TableCell>
										<TableCell>
											<Badge variant={plan.active ? "success" : "outline"}>
												{plan.active ? "active" : "off"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<PricingPlanEditDialog plan={plan} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
