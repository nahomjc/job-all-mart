import { Link } from "@/i18n/routing";
import { redirectTo } from "@/i18n/redirect";
import { getTranslations } from "next-intl/server";
import { JobForm } from "@/components/jobs/job-form";
import { PostJobHelpDialog } from "@/components/jobs/post-job-help-dialog";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { categoryRepo } from "@/server/repositories/category";

export const metadata = { title: "Post a job" };

export default async function SimplePostJobPage(props: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = (await props.params) as { locale: "en" | "am" };
	const user = await getCurrentUser();
	if (!user) {
		return await redirectTo("/login?mode=signup&next=/post/new");
	}

	const tj = await getTranslations("jobs");
	const categories = await categoryRepo.list();

	return (
		<div className="container mx-auto max-w-6xl px-4 pb-16 pt-28">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						{locale === "am" ? "ፈጣን የስራ ማስታወቂያ" : "Quick post"}
					</p>
					<h1 className="mt-1 text-3xl font-bold tracking-tight">
						{tj("postTitle")}
					</h1>
					<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
						{locale === "am"
							? "የስራውን ዝርዝር ይሙሉ፣ ያረጋግጡና ይክፈሉ። ማስታወቂያው ከመውጣቱ በፊት ተገምግሞ ይረጋገጣል።"
							: "Six steps: job details, review, then payment. We check it before it goes live."}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
					<PostJobHelpDialog />
					<Button asChild variant="ghost" size="sm">
						<Link href="/dashboard">
							{locale === "am" ? "ወደ ዳሽቦርድ" : "Open dashboard"}
						</Link>
					</Button>
				</div>
			</div>

			<div className="rounded-2xl border bg-card p-5 sm:p-8 lg:p-10">
				<JobForm
					categories={categories.map((c) => ({ id: c.id, name: c.name }))}
					flow="simple"
				/>
			</div>
		</div>
	);
}
