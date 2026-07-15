import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL_MIGRATIONS || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const sql = postgres(url, { max: 1 });

const table = await sql`
  select to_regclass('public.pricing_plans') as exists
`;
const count = await sql`select count(*)::int as n from pricing_plans`;
const enums = await sql`
  select enumlabel
  from pg_enum e
  join pg_type t on t.oid = e.enumtypid
  where t.typname = 'audit_action' and enumlabel like 'plan.%'
  order by enumlabel
`;

let migrations = null;
try {
	migrations = await sql`
    select id, hash, created_at
    from drizzle.__drizzle_migrations
    order by created_at desc
    limit 5
  `;
} catch {
	migrations = "drizzle.__drizzle_migrations not found / inaccessible";
}

console.log(
	JSON.stringify(
		{
			pricingPlansTable: table[0]?.exists,
			planCount: count[0]?.n,
			planEnums: enums.map((r) => r.enumlabel),
			recentDrizzleMigrations: migrations,
		},
		null,
		2,
	),
);

await sql.end();
