"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PricingPlanFields } from "@/components/admin/pricing-plan-fields";
import {
	deletePricingPlanAction,
	updatePricingPlanAction,
} from "@/server/actions/admin";
import type { PricingPlan } from "@/server/db/schema";

interface PricingPlanEditDialogProps {
	plan: PricingPlan;
}

export function PricingPlanEditDialog({ plan }: PricingPlanEditDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [pending, startTransition] = useTransition();

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		startTransition(async () => {
			const result = await updatePricingPlanAction({ ok: false }, formData);
			if (result.ok) {
				toast.success("Pricing plan updated");
				setOpen(false);
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to update plan");
			}
		});
	};

	const onDelete = () => {
		if (!window.confirm(`Delete plan “${plan.name}”?`)) return;
		startTransition(async () => {
			const result = await deletePricingPlanAction(plan.id);
			if (result.ok) {
				toast.success("Plan deleted");
				setOpen(false);
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to delete plan");
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5">
					<Pencil className="size-3.5" />
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Edit pricing plan</DialogTitle>
					<DialogDescription>
						Changes show on the public /pricing page right away.
					</DialogDescription>
				</DialogHeader>
				<form
					key={plan.updatedAt.toISOString()}
					onSubmit={onSubmit}
					className="space-y-4"
				>
					<input type="hidden" name="id" value={plan.id} />
					<PricingPlanFields
						idPrefix={`edit-${plan.id}`}
						showStatus
						values={{
							name: plan.name,
							slug: plan.slug,
							description: plan.description ?? "",
							priceLabel: plan.priceLabel,
							cadence: plan.cadence,
							features: (plan.features ?? []).join("\n"),
							ctaLabel: plan.ctaLabel,
							ctaHref: plan.ctaHref,
							highlight: plan.highlight,
							sortOrder: plan.sortOrder,
							active: plan.active,
						}}
					/>
					<DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
						<Button
							type="button"
							variant="destructive"
							onClick={onDelete}
							disabled={pending}
							className="gap-1.5"
						>
							<Trash2 className="size-3.5" />
							Delete
						</Button>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={pending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={pending}>
								{pending ? "Saving…" : "Save changes"}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
