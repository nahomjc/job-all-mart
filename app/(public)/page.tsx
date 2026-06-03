import { HeroSection } from "@/components/home/hero-section";
import { JobPostStepsSection } from "@/components/home/job-post-steps-section";
import { PipelineSection } from "@/components/home/pipeline-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { WhyUsSection } from "@/components/home/why-us-section";
import { CtaSection } from "@/components/home/cta-section";
import { jobRepo } from "@/server/repositories/job";
import { categoryRepo } from "@/server/repositories/category";
import { requiredChannelJoinUrl } from "@/lib/telegram/required-channel";

export default async function HomePage() {
	const [recent, categories] = await Promise.all([
		jobRepo.listPublic({ limit: 6 }),
		categoryRepo.list(),
	]);

	const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "JobPost";

	return (
		<div className="overflow-hidden">
			<HeroSection
				telegramJoinUrl={requiredChannelJoinUrl()}
				appName={appName}
			/>
			<JobPostStepsSection />
			<PipelineSection />
			<CategoriesSection categories={categories.slice(0, 4)} />
			<HowItWorksSection appName={appName} />
			<LatestJobsSection jobs={recent} />
			<WhyUsSection />
			<CtaSection telegramJoinUrl={requiredChannelJoinUrl()} />
		</div>
	);
}
