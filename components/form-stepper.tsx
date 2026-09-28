"use client";

import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormStep = {
	id: string;
	title: string;
	short: string;
	icon?: LucideIcon;
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
			<ol
				className="grid w-full gap-2"
				style={{
					gridTemplateColumns: `repeat(${Math.min(steps.length, 6)}, minmax(0, 1fr))`,
				}}
			>
				{steps.map((step, i) => {
					const done = i < stepIndex;
					const active = i === stepIndex;
					const clickable = Boolean(onStepClick && i < stepIndex);
					const Icon = step.icon;

					return (
						<li key={step.id} className="min-w-0">
							<button
								type="button"
								disabled={!clickable}
								onClick={() => clickable && onStepClick?.(i)}
								title={step.title}
								className={cn(
									"flex h-full w-full min-w-0 items-center justify-center gap-1.5 rounded-full border px-2 py-1.5 text-left text-xs font-medium transition sm:justify-start sm:px-2.5 sm:text-sm",
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
								{Icon ? (
									<span
										className={cn(
											"flex shrink-0 items-center justify-center",
											active && "text-primary",
											done && !active && "text-amber-700 dark:text-amber-300",
											!active && !done && "text-muted-foreground",
										)}
									>
										<Icon className="size-3.5" aria-hidden />
									</span>
								) : null}
								<span className="min-w-0 truncate">{step.short}</span>
							</button>
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
