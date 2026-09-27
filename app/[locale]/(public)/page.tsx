import { JobPostStepsSection } from "@/components/home/job-post-steps-section";
import { LatestJobsSection } from "@/components/home/latest-jobs-section";
import { jobRepo } from "@/server/repositories/job";

export default async function HomePage() {
	const recent = await jobRepo.listPublic({ limit: 4 });

	return (
		<div className="overflow-hidden">
			<JobPostStepsSection />
			<LatestJobsSection jobs={recent} />
		</div>
	);
}
