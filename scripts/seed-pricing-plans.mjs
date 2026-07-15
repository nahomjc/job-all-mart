import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL_MIGRATIONS || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
const sql = postgres(url);

const plans = [
	{
		slug: "free",
		name: "Free",
		description: "One free post every 30 days.",
		price: "ETB 0",
		cadence: "/post",
		features: [
			"1 free post / 30 days",
			"Review within 24 hours",
			"Posted to Telegram",
		],
		cta: "Start free",
		href: "/post/new",
		highlight: false,
		sort: 0,
	},
	{
		slug: "basic",
		name: "Basic",
		description: "For a few posts at a time.",
		price: "ETB 500",
		cadence: "/post",
		features: [
			"Same-day review (often under 2 hours)",
			"Logo and company name",
			"Website and Telegram",
		],
		cta: "Buy a post",
		href: "/post/new",
		highlight: true,
		sort: 1,
	},
	{
		slug: "pro",
		name: "Pro",
		description: "Pinned and featured for 24 hours.",
		price: "ETB 1,250",
		cadence: "/post",
		features: [
			"Pinned and featured for 24h",
			"Priority review",
			"One repost after 14 days",
		],
		cta: "Buy Pro",
		href: "/post/new",
		highlight: false,
		sort: 2,
	},
	{
		slug: "enterprise",
		name: "Enterprise",
		description: "Bulk posts, custom branding, and API access.",
		price: "Custom",
		cadence: "",
		features: [
			"Bulk posts via API",
			"Dedicated Telegram channel",
			"Account manager",
		],
		cta: "Contact us",
		href: "/post/new",
		highlight: false,
		sort: 3,
	},
];

for (const p of plans) {
	await sql`
    INSERT INTO pricing_plans (
      slug, name, description, price_label, cadence, features,
      cta_label, cta_href, highlight, sort_order, active
    )
    VALUES (
      ${p.slug}, ${p.name}, ${p.description}, ${p.price}, ${p.cadence},
      ${sql.json(p.features)}, ${p.cta}, ${p.href}, ${p.highlight}, ${p.sort}, true
    )
    ON CONFLICT (slug) DO NOTHING
  `;
}

console.log("Seeded pricing plans");
await sql.end();
