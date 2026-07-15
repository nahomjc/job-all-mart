import { HeroSection } from "@/components/home/hero-section";
import { JobPostStepsSection } from "@/components/home/job-post-steps-section";
import { PipelineSection } from "@/components/home/pipeline-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { WhyUsSection } from "@/components/home/why-us-section";
import { CtaSection } from "@/components/home/cta-section";
import { jobRepo } from "@/server/repositories/job";
import { requiredChannelJoinUrl } from "@/lib/telegram/required-channel";
import { env } from "@/lib/env";

export default async function HomePage() {
	const recent = await jobRepo.listPublic({ limit: 6 });

	const appName = env.NEXT_PUBLIC_APP_NAME;

	return (
		<div className="overflow-hidden">
			<HeroSection
				telegramJoinUrl={requiredChannelJoinUrl()}
				appName={appName}
			/>
			<JobPostStepsSection />
			<PipelineSection />
			<HowItWorksSection appName={appName} />
			<LatestJobsSection jobs={recent} />
			<WhyUsSection />
			<CtaSection telegramJoinUrl={requiredChannelJoinUrl()} />
		</div>
	);
}
