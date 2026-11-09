import type { Job, Category } from "@/server/db/schema";

interface JobPostingJsonLdProps {
  job: Job;
  category: Category | null;
  canonicalHost: string;
  locale: string;
}

export function JobPostingJsonLd({ 
  job, 
  category, 
  canonicalHost, 
  locale 
}: JobPostingJsonLdProps) {
  const employmentTypeMap: Record<string, string> = {
    full_time: "FULL_TIME",
    part_time: "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
    remote: "FULL_TIME",
  };

  const baseSalary = job.salaryMin || job.salaryMax ? {
    "@type": "MonetaryAmount",
    currency: job.salaryCurrency || "ETB",
    value: {
      "@type": "QuantitativeValue",
      ...(job.salaryMin && job.salaryMax
        ? { minValue: job.salaryMin, maxValue: job.salaryMax }
        : job.salaryMin
          ? { value: job.salaryMin }
          : { value: job.salaryMax }
      ),
      unitText: "MONTH",
    },
  } : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "MAK Adverts",
      value: job.id,
    },
    datePosted: job.postedAt?.toISOString() || job.createdAt.toISOString(),
    ...(job.expiresAt && { validThrough: job.expiresAt.toISOString() }),
    employmentType: employmentTypeMap[job.employmentType] || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      ...(job.logoUrl && { logo: job.logoUrl }),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Dire Dawa",
        addressCountry: "ET",
      },
    },
    ...(job.employmentType === "remote" && {
      jobLocationType: "TELECOMMUTE",
    }),
    ...(baseSalary && { baseSalary }),
    ...(category && {
      occupationalCategory: category.name,
    }),
    url: `${canonicalHost}/${locale}/jobs/${job.slug}`,
    directApply: !!job.applyUrl,
    ...(job.applyUrl && { applicationContact: { "@type": "ContactPoint", url: job.applyUrl } }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
