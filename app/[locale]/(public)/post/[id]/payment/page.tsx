import { Link } from "@/i18n/routing";
import { redirectTo } from "@/i18n/redirect";
import { notFound } from "next/navigation";
import { PaymentForm } from "@/components/jobs/payment-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";

export const metadata = { title: "Upload payment" };

export default async function SimplePaymentPage(props: {
	params: Promise<{ id: string; locale: string }>;
}) {
	const { id, locale } = (await props.params) as {
		id: string;
		locale: "en" | "am";
	};
	const user = await getCurrentUser();
	if (!user) {
		return await redirectTo(`/login?mode=signup&next=${encodeURIComponent(`/post/${id}/payment`)}`);
	}

	const job = await jobRepo.byId(id);
	if (!job) notFound();
	if (job.userId !== user.id) {
		return await redirectTo("/post/new");
	}

	return (
		<div className="container mx-auto max-w-2xl px-4 pb-16 pt-28">
			<div className="mb-8">
				<p className="text-sm font-semibold uppercase tracking-wider text-primary">
					{locale === "am" ? "ክፍያ እና ግብይት" : "Payment"}
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight">
					{locale === "am" ? "የክፍያ ማስረጃ ይስቀሉ" : "Upload payment proof"}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					{locale === "am" ? "ለ " : "For "}
					<span className="font-medium text-foreground">{job.title}</span>{" "}
					{locale === "am" ? "በ " : "at "}
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
				{locale === "am"
					? "ሁሉንም አማራጮች በዳሽቦርድ ማስተዳደር ይፈልጋሉ? "
					: "Prefer the full tools? "}
				<Button asChild variant="link" className="h-auto p-0">
					<Link href={`/dashboard/jobs/${job.id}`}>
						{locale === "am" ? "በዳሽቦርድ ይክፈቱ" : "Open in dashboard"}
					</Link>
				</Button>
			</p>
		</div>
	);
}
