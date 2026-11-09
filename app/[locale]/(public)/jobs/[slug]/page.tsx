import { notFound } from "next/navigation";
import { PublicJobDetail } from "@/components/jobs/public-job-detail";
import { JobPostingJsonLd } from "@/components/seo/job-posting-jsonld";
import { jobRepo } from "@/server/repositories/job";

const CANONICAL_HOST = "https://www.makadverts.com";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const job = await jobRepo.bySlug(slug);
  if (!job) return { title: "Job not found" };
  
  const locationSuffix = job.location ? ` in ${job.location}` : " in Ethiopia";
  const title = `${job.title} at ${job.company}${locationSuffix}`;
  const description = job.description.slice(0, 155).trim() + "...";
  
  return {
    title,
    description,
    alternates: {
      canonical: `${CANONICAL_HOST}/${locale}/jobs/${slug}`,
      languages: {
        en: `${CANONICAL_HOST}/en/jobs/${slug}`,
        am: `${CANONICAL_HOST}/am/jobs/${slug}`,
        "x-default": `${CANONICAL_HOST}/en/jobs/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${CANONICAL_HOST}/${locale}/jobs/${slug}`,
      images: job.logoUrl 
        ? [{ url: job.logoUrl, alt: `${job.company} logo` }]
        : [`${CANONICAL_HOST}/images/photo_2026-09-27_19-36-28-Photoroom.png`],
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const data = await jobRepo.bySlugWithRelations(slug);
  if (!data || data.job.status !== "posted") notFound();

  return (
    <>
      <JobPostingJsonLd 
        job={data.job} 
        category={data.category}
        canonicalHost={CANONICAL_HOST}
        locale={locale}
      />
      <PublicJobDetail
        job={data.job}
        category={data.category}
        employer={data.employer}
      />
    </>
  );
}
