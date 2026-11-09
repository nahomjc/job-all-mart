import type { MetadataRoute } from "next";
import { db } from "@/server/db/client";
import { categories, jobs } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

const CANONICAL_HOST = "https://www.makadverts.com";
const LOCALES = ["en", "am"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/jobs", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/pricing", priority: 0.7, changeFrequency: "weekly" as const },
  ];

  for (const page of staticPages) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${CANONICAL_HOST}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            en: `${CANONICAL_HOST}/en${page.path}`,
            am: `${CANONICAL_HOST}/am${page.path}`,
          },
        },
      });
    }
  }

  try {
    const publishedJobs = await db
      .select({ slug: jobs.slug, updatedAt: jobs.updatedAt, postedAt: jobs.postedAt })
      .from(jobs)
      .where(eq(jobs.status, "posted"))
      .orderBy(desc(jobs.postedAt))
      .limit(1000);

    for (const job of publishedJobs) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${CANONICAL_HOST}/${locale}/jobs/${job.slug}`,
          lastModified: job.updatedAt ?? job.postedAt ?? new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: {
            languages: {
              en: `${CANONICAL_HOST}/en/jobs/${job.slug}`,
              am: `${CANONICAL_HOST}/am/jobs/${job.slug}`,
            },
          },
        });
      }
    }

    const activeCategories = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.active, true));

    for (const cat of activeCategories) {
      for (const locale of LOCALES) {
        entries.push({
          url: `${CANONICAL_HOST}/${locale}/jobs?category=${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.6,
          alternates: {
            languages: {
              en: `${CANONICAL_HOST}/en/jobs?category=${cat.slug}`,
              am: `${CANONICAL_HOST}/am/jobs?category=${cat.slug}`,
            },
          },
        });
      }
    }
  } catch {
    // If database is unavailable, return only static pages
  }

  return entries;
}
