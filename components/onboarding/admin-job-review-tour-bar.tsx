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
				className="h-11 w-full shrink-0 gap-2 sm:w-auto"
				onClick={() => startProductTour("admin-job-review")}
			>
				<HelpCircle className="size-4" />
				<span className="hidden sm:inline">Guided tour</span>
			</Button>
		</>
	);
}
