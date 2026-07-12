"use client";

import type { Step } from "react-joyride";
import { ProductTour } from "@/components/onboarding/product-tour";

const steps: Step[] = [
	{
		target: '[data-tour="brand"]',
		title: "Welcome, admin",
		content:
			"A quick tour of the moderation tools. It takes less than a minute — replay it anytime from Help.",
		placement: "right",
	},
	{
		target: '[data-tour="nav-queue"]',
		title: "Approval queue",
		content:
			"Review submitted jobs here. Verify the payment, then approve to publish to Telegram.",
		placement: "right",
	},
	{
		target: '[data-tour="nav-payments"]',
		title: "Payments",
		content:
			"Check payment screenshots and references before a job goes live.",
		placement: "right",
	},
	{
		target: '[data-tour="nav-settings"]',
		title: "Settings",
		content:
			"Configure Telegram delivery — including the broadcast channel where approved jobs are posted.",
		placement: "right",
	},
	{
		target: '[data-tour="search"]',
		title: "Search everything",
		content: "Find jobs, users, and payments across the platform. Tip: Ctrl/⌘ + F.",
		placement: "bottom",
	},
	{
		target: '[data-tour="header-actions"]',
		title: "Quick actions",
		content:
			"Jump to the review queue, switch theme, and see notifications from here.",
		placement: "bottom",
	},
];

export function AdminTour() {
	return <ProductTour tourKey="admin" steps={steps} />;
}
