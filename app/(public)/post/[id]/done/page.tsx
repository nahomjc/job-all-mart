import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { jobRepo } from "@/server/repositories/job";

export const metadata = { title: "Submitted" };

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

	return (
		<div className="container mx-auto flex max-w-lg flex-col items-center px-4 pb-20 pt-32 text-center">
			<span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
				<CheckCircle2 className="size-7" />
			</span>
			<h1 className="mt-6 text-3xl font-bold tracking-tight">Job submitted</h1>
			<p className="mt-3 text-muted-foreground">
				<span className="font-medium text-foreground">{job.title}</span> is in
				review. We&apos;ll publish it after payment and details are checked.
			</p>
			<div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
				<Button asChild size="lg" className="rounded-full">
					<Link href="/post/new">Post another job</Link>
				</Button>
				<Button asChild size="lg" variant="outline" className="rounded-full">
					<Link href="/dashboard/jobs">View my jobs</Link>
				</Button>
			</div>
		</div>
	);
}
