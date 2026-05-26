import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_URL_MIGRATIONS ||
  process.env.DATABASE_URL ||
  "";

if (!url) {
  throw new Error(
    "Neither DATABASE_URL_MIGRATIONS nor DATABASE_URL is set. Add one to .env before running drizzle-kit."
  );
}

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
});
