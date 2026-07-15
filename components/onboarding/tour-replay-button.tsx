"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startProductTour } from "@/components/onboarding/product-tour";

interface TourReplayButtonProps {
	tourKey: string;
}

export function TourReplayButton({ tourKey }: TourReplayButtonProps) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			className="size-10 rounded-full text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
			aria-label="Replay guided tour"
			title="Replay guided tour"
			onClick={() => startProductTour(tourKey)}
		>
			<HelpCircle className="size-5" />
		</Button>
	);
}
