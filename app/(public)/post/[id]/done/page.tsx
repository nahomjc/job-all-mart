import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
	ArrowRight,
	Building2,
	CheckCircle2,
	Clock,
	Send,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { cn } from "@/lib/utils";

export const metadata = { title: "Submitted" };

const NEXT_STEPS = [
	{
		icon: CheckCircle2,
		title: "Submission received",
		description: "Your job details and payment proof are on file.",
		done: true,
	},
	{
		icon: Shield,
		title: "Admin review",
		description: "We verify payment and check the posting for quality.",
		done: false,
	},
	{
		icon: Send,
		title: "Go live",
		description: "Once approved, it appears on the site and Telegram.",
		done: false,
	},
] as const;

export default async function SimplePostDonePage(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const user = await getCurrentUser();
	if (!user) {
		redirect(`/login?next=${encodeURIComponent(`/post/${id}/done`)}`);
	}

	const job = await jobRepo.byId(id);
	if (!job) notFound();
	if (job.userId !== user.id) redirect("/post/new");

	const payment = await paymentRepo.byJobId(job.id);
	const paymentDone = Boolean(payment);

	return (
		<div className="relative overflow-hidden">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_60%)]"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -right-24 top-40 size-72 rounded-full bg-primary/10 blur-3xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -left-16 bottom-20 size-56 rounded-full bg-[color-mix(in_oklab,var(--brand-deep)_8%,transparent)] blur-3xl"
			/>

			<div className="container relative mx-auto max-w-2xl px-4 pb-20 pt-28">
				<div className="flex flex-col items-center text-center">
					<div className="relative">
						<span
							aria-hidden
							className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-ping motion-safe:animation-duration-[2.4s]"
						/>
						<span className="relative flex size-16 items-center justify-center rounded-full border border-primary/25 bg-linear-to-b from-primary/20 to-primary/5 text-primary shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_25%,transparent)]">
							<CheckCircle2 className="size-8" strokeWidth={2.25} />
						</span>
					</div>

					<p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">
						All set
					</p>
					<h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
						Job submitted successfully
					</h1>
					<p className="mt-3 max-w-md text-muted-foreground">
						We&apos;re reviewing your posting now. You&apos;ll be notified when
						it goes live — usually within a few hours.
					</p>
				</div>

				<div className="mt-10 overflow-hidden rounded-2xl border bg-card/90 shadow-sm backdrop-blur-sm">
					<div className="border-b bg-linear-to-r from-primary/8 via-primary/4 to-transparent px-5 py-4 sm:px-6">
						<div className="flex items-start gap-3">
							<span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
								<Building2 className="size-5" />
							</span>
							<div className="min-w-0 text-left">
								<p className="truncate text-lg font-semibold tracking-tight">
									{job.title}
								</p>
								<p className="mt-0.5 truncate text-sm text-muted-foreground">
									{job.company}
								</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 border-b px-5 py-3 text-sm sm:px-6">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
							<Clock className="size-3.5" />
							Under review
						</span>
						{paymentDone ? (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
								Payment received
							</span>
						) : null}
					</div>

					<div className="px-5 py-5 sm:px-6">
						<p className="mb-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							What happens next
						</p>
						<ol className="space-y-0">
							{NEXT_STEPS.map((step, index) => {
								const Icon = step.icon;
								return (
									<li
										key={step.title}
										className={cn(
											"relative flex gap-4 pb-6 last:pb-0",
											index < NEXT_STEPS.length - 1 &&
												"before:absolute before:left-[15px] before:top-8 before:h-[calc(100%-1.5rem)] before:w-px before:bg-border",
										)}
									>
										<span
											className={cn(
												"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
												step.done
													? "border-primary bg-primary text-primary-foreground"
													: "border-border bg-muted text-muted-foreground",
											)}
										>
											<Icon className="size-4" />
										</span>
										<div className="min-w-0 pt-0.5 text-left">
											<p
												className={cn(
													"font-medium",
													!step.done && "text-muted-foreground",
												)}
											>
												{step.title}
											</p>
											<p className="mt-0.5 text-sm text-muted-foreground">
												{step.description}
											</p>
										</div>
									</li>
								);
							})}
						</ol>
					</div>
				</div>

				<div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
					<Button asChild size="lg" className="rounded-full">
						<Link href={`/dashboard/jobs/${job.id}`}>
							Track this job
							<ArrowRight className="size-4" />
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline" className="rounded-full">
						<Link href="/post/new">Post another job</Link>
					</Button>
				</div>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Or browse everything in your{" "}
					<Button asChild variant="link" className="h-auto p-0">
						<Link href="/dashboard/jobs">job dashboard</Link>
					</Button>
					.
				</p>
			</div>
		</div>
	);
}
