import "dotenv/config";
import postgres from "postgres";
import { createHash } from "crypto";
import { readFileSync } from "fs";

const url = process.env.DATABASE_URL_MIGRATIONS || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const sql = postgres(url, { max: 1 });

const hash = createHash("sha256")
	.update(readFileSync("./drizzle/0004_flowery_lilandra.sql"))
	.digest("hex");
const createdAt = "1784137458980";

const existing = await sql`
  select id from drizzle.__drizzle_migrations where hash = ${hash} limit 1
`;

if (existing.length) {
	console.log("Migration 0004 already recorded");
} else {
	await sql`
    insert into drizzle.__drizzle_migrations (hash, created_at)
    values (${hash}, ${createdAt})
  `;
	console.log("Recorded migration 0004_flowery_lilandra");
}

await sql.end();
