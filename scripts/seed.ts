/**
 * Seeds the database with a few default categories.
 * Safe to re-run — uses upsert-by-slug semantics.
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories } from "../server/db/schema";

const defaults: Array<{
  slug: string;
  name: string;
  description: string;
  telegramTopicId?: number;
  sortOrder: number;
}> = [
  {
    slug: "vacancy",
    name: "Vacancy",
    description: "General job vacancies across industries.",
    sortOrder: 0,
  },
  {
    slug: "it-jobs",
    name: "IT Jobs",
    description: "Software, IT support, devops, data, design.",
    sortOrder: 10,
  },
  {
    slug: "remote-jobs",
    name: "Remote Jobs",
    description: "Work-from-anywhere positions.",
    sortOrder: 20,
  },
  {
    slug: "internships",
    name: "Internships",
    description: "Internship and graduate trainee programs.",
    sortOrder: 30,
  },
  {
    slug: "freelance",
    name: "Freelance & Gigs",
    description: "Contract, project, and freelance work.",
    sortOrder: 40,
  },
];

async function main() {
  const url = process.env.DATABASE_URL_MIGRATIONS ?? process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  for (const c of defaults) {
    await db
      .insert(categories)
      .values({
        slug: c.slug,
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
        active: true,
        telegramTopicId: c.telegramTopicId,
      })
      .onConflictDoNothing({ target: categories.slug });
  }

  console.log(`Seeded ${defaults.length} categories.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
