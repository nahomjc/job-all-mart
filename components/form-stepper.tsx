"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormStep = {
	id: string;
	title: string;
	short: string;
};

interface FormStepperProps {
	steps: FormStep[];
	stepIndex: number;
	onStepClick?: (index: number) => void;
	ariaLabel?: string;
}

export function FormStepper({
	steps,
	stepIndex,
	onStepClick,
	ariaLabel = "Form progress",
}: FormStepperProps) {
	const currentStep = steps[stepIndex];

	return (
		<nav aria-label={ariaLabel} className="mb-6 flex flex-col gap-3">
			<ol className="flex flex-wrap items-center gap-2">
				{steps.map((step, i) => {
					const done = i < stepIndex;
					const active = i === stepIndex;
					const clickable = Boolean(onStepClick && i < stepIndex);

					return (
						<li key={step.id} className="flex min-w-0 items-center gap-2">
							<button
								type="button"
								disabled={!clickable}
								onClick={() => clickable && onStepClick?.(i)}
								className={cn(
									"flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1 text-left text-xs font-medium transition sm:px-3 sm:text-sm",
									active &&
										"border-primary bg-primary/10 text-primary shadow-sm",
									done &&
										!active &&
										"border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
									!active && !done && "border-border text-muted-foreground",
									clickable && "hover:bg-muted/60",
								)}
							>
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
										active && "bg-primary text-primary-foreground",
										done && !active && "bg-amber-600 text-white",
										!active && !done && "bg-muted text-muted-foreground",
									)}
								>
									{done ? <Check className="size-3.5" /> : i + 1}
								</span>
								<span className="hidden truncate sm:inline">{step.title}</span>
								<span className="truncate sm:hidden">{step.short}</span>
							</button>
							{i < steps.length - 1 && (
								<span
									aria-hidden
									className="hidden h-px w-4 bg-border sm:block"
								/>
							)}
						</li>
					);
				})}
			</ol>
			<p className="text-xs text-muted-foreground">
				Step {stepIndex + 1} of {steps.length}:{" "}
				<span className="font-medium text-foreground">{currentStep?.title}</span>
			</p>
		</nav>
	);
}
