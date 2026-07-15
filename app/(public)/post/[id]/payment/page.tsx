import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaymentForm } from "@/components/jobs/payment-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";

export const metadata = { title: "Upload payment" };

export default async function SimplePaymentPage(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	const user = await getCurrentUser();
	if (!user) {
		redirect(`/login?mode=signup&next=${encodeURIComponent(`/post/${id}/payment`)}`);
	}

	const job = await jobRepo.byId(id);
	if (!job) notFound();
	if (job.userId !== user.id) redirect("/post/new");

	return (
		<div className="container mx-auto max-w-2xl px-4 pb-16 pt-28">
			<div className="mb-8">
				<p className="text-sm font-semibold uppercase tracking-wider text-primary">
					Payment
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight">
					Upload payment proof
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					For{" "}
					<span className="font-medium text-foreground">{job.title}</span> at{" "}
					{job.company}
				</p>
			</div>

			<div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
				<PaymentForm
					jobId={job.id}
					successHref={`/post/${job.id}/done`}
					cancelHref="/post/new"
				/>
			</div>

			<p className="mt-6 text-center text-sm text-muted-foreground">
				Prefer the full tools?{" "}
				<Button asChild variant="link" className="h-auto p-0">
					<Link href={`/dashboard/jobs/${job.id}`}>Open in dashboard</Link>
				</Button>
			</p>
		</div>
	);
}
