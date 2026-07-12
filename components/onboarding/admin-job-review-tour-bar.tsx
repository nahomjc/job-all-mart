"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminJobReviewTour } from "@/components/onboarding/admin-job-review-tour";
import { startProductTour } from "@/components/onboarding/product-tour";

export function AdminJobReviewTourBar() {
	return (
		<>
			<AdminJobReviewTour />
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="h-10 shrink-0 gap-2 rounded-xl"
				onClick={() => startProductTour("admin-job-review")}
			>
				<HelpCircle className="size-4" />
				<span className="hidden sm:inline">Guided tour</span>
			</Button>
		</>
	);
}
