"use client";

import type { Step } from "react-joyride";
import { ProductTour } from "@/components/onboarding/product-tour";

const steps: Step[] = [
	{
		target: '[data-tour="brand"]',
		title: "Welcome to your dashboard",
		content:
			"Quick tour of the essentials — it takes less than a minute. You can replay it anytime from Help.",
		placement: "right",
	},
	{
		target: '[data-tour="nav-dashboard"]',
		title: "Your overview",
		content:
			"See all your posts at a glance — totals, pending review, posted, and rejected.",
		placement: "right",
	},
	{
		target: '[data-tour="nav-post-job"]',
		title: "Post a job",
		content:
			"Start here to submit a new job. It's a short step-by-step form, then you upload payment proof.",
		placement: "right",
	},
	{
		target: '[data-tour="nav-jobs"]',
		title: "Track your jobs",
		content:
			"View every submission and its status — pending payment, in review, posted, or rejected.",
		placement: "right",
	},
	{
		target: '[data-tour="search"]',
		title: "Search quickly",
		content: "Find your jobs and payments fast. Tip: press Ctrl/⌘ + F to focus it.",
		placement: "bottom",
	},
	{
		target: '[data-tour="header-actions"]',
		title: "Actions & theme",
		content:
			"Create a new job, switch light/dark mode, and check notifications from here.",
		placement: "bottom",
	},
];

export function DashboardTour() {
	return <ProductTour tourKey="dashboard" steps={steps} />;
}
