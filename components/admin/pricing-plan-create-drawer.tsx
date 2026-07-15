"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PricingPlanFields } from "@/components/admin/pricing-plan-fields";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { createPricingPlanAction } from "@/server/actions/admin";

export function PricingPlanCreateDrawer() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [pending, startTransition] = useTransition();

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		startTransition(async () => {
			const result = await createPricingPlanAction({ ok: false }, formData);
			if (result.ok) {
				toast.success("Pricing plan created");
				form.reset();
				setOpen(false);
				router.refresh();
			} else {
				toast.error(result.error ?? "Failed to create plan");
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-1.5">
					<Plus className="size-4" />
					New price
				</Button>
			</DialogTrigger>
			<DialogContent
				aria-describedby={undefined}
				className="fixed inset-y-0 right-0 left-auto top-0 z-50 flex h-full max-h-none w-full max-w-lg translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-l p-0 shadow-xl duration-300 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:max-w-md sm:rounded-none"
			>
				<div className="flex h-full min-h-0 flex-col bg-background">
					<DialogHeader className="shrink-0 border-b px-5 py-4 text-left">
						<DialogTitle>New pricing plan</DialogTitle>
						<DialogDescription>
							Add a tier for the public /pricing page. Features: one per line.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={onSubmit}
						className="flex min-h-0 flex-1 flex-col"
					>
						<div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
							<PricingPlanFields idPrefix="create-drawer" />
						</div>
						<div className="shrink-0 border-t px-5 py-4">
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
									disabled={pending}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={pending}>
									{pending ? "Creating…" : "Create plan"}
								</Button>
							</div>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
