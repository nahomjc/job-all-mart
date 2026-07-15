import Link from "next/link";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/jobs/job-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { categoryRepo } from "@/server/repositories/category";

export const metadata = { title: "Post a job" };

export default async function SimplePostJobPage() {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/login?mode=signup&next=/post/new");
	}

	const categories = await categoryRepo.list();

	return (
		<div className="container mx-auto max-w-6xl px-4 pb-16 pt-28">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						Quick post
					</p>
					<h1 className="mt-1 text-3xl font-bold tracking-tight">Post a job</h1>
					<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
						Six steps: job details, review, then payment. We check it before it
						goes live.
					</p>
				</div>
				<Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
					<Link href="/dashboard">Open dashboard</Link>
				</Button>
			</div>

			<div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8 lg:p-10">
				<JobForm
					categories={categories.map((c) => ({ id: c.id, name: c.name }))}
					flow="simple"
				/>
			</div>
		</div>
	);
}
