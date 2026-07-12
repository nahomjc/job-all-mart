"use client";

import type { Step } from "react-joyride";
import { ProductTour } from "@/components/onboarding/product-tour";

const steps: Step[] = [
	{
		target: '[data-tour="job-review-status"]',
		title: "Status at a glance",
		content:
			"Check job status, payment state, spam score, and where the submission came from before you dig in.",
		placement: "bottom",
	},
	{
		target: '[data-tour="job-review-moderation"]',
		title: "Moderation workspace",
		content:
			"This is where you review the job, verify payment, and approve or reject. Use the tabs to switch tasks.",
		placement: "top",
	},
	{
		target: '[data-tour="job-review-tab-verify"]',
		title: "Verification tab",
		content:
			"Start here for new submissions. Walk through payment proof, reference check, and approval in order.",
		placement: "bottom",
	},
	{
		target: '[data-tour="job-review-wizard"]',
		title: "Step-by-step wizard",
		content:
			"Complete each step: review the screenshot, check the transaction reference, confirm payment, then approve & publish.",
		placement: "bottom",
	},
	{
		target: '[data-tour="job-review-view-details"]',
		title: "View job details",
		content:
			"Click here to open the full posting — title, company, salary, description, and apply link — in a pop-up before you approve.",
		placement: "bottom",
	},
	{
		target: '[data-tour="job-review-payment"]',
		title: "Payment proof",
		content:
			"The screenshot and payer details stay visible here while you work. Tap the image to open it full size.",
		placement: "left",
	},
	{
		target: '[data-tour="job-review-employer"]',
		title: "Who submitted it",
		content:
			"See the employer's email or Telegram handle and open their profile if you need more context.",
		placement: "left",
	},
	{
		target: '[data-tour="job-review-telegram-hint"]',
		title: "What happens on approve",
		content:
			"Approving publishes the job to your Telegram group (and broadcast channel if enabled) and marks it live on the website.",
		placement: "left",
	},
];

export function AdminJobReviewTour() {
	return <ProductTour tourKey="admin-job-review" steps={steps} />;
}
