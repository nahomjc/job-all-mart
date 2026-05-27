import { notFound } from "next/navigation";
import { PublicJobDetail } from "@/components/jobs/public-job-detail";
import { jobRepo } from "@/server/repositories/job";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const job = await jobRepo.bySlug(slug);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} at ${job.company}`,
    description: job.description.slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await jobRepo.bySlugWithRelations(slug);
  if (!data || data.job.status !== "posted") notFound();

  return (
    <PublicJobDetail
      job={data.job}
      category={data.category}
      employer={data.employer}
    />
  );
}
