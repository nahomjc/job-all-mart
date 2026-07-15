import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Pricing",
  description: "Pay per job post. No subscription.",
};

const tiers = [
  {
    name: "Free",
    price: "ETB 0",
    cadence: "/post",
    description: "One free post every 30 days.",
    features: [
      "1 free post / 30 days",
      "Review within 24 hours",
      "Posted to Telegram",
    ],
    cta: "Start free",
  },
  {
    name: "Basic",
    price: "ETB 500",
    cadence: "/post",
    description: "For a few posts at a time.",
    features: [
      "Same-day review (often under 2 hours)",
      "Logo and company name",
      "Website and Telegram",
    ],
    cta: "Buy a post",
    highlight: true,
  },
  {
    name: "Pro",
    price: "ETB 1,250",
    cadence: "/post",
    description: "Pinned and featured for 24 hours.",
    features: [
      "Pinned and featured for 24h",
      "Priority review",
      "One repost after 14 days",
    ],
    cta: "Buy Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    description: "Bulk posts, custom branding, and API access.",
    features: [
      "Bulk posts via API",
      "Dedicated Telegram channel",
      "Account manager",
    ],
    cta: "Contact us",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Pay per post. No subscription. We review each job before it goes live.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={t.highlight ? "border-primary shadow-lg" : ""}
          >
            <CardHeader>
              <CardTitle>{t.name}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.cadence}</span>
              </div>
              <ul className="mb-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-sky-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full"
                variant={t.highlight ? "default" : "outline"}
              >
                <Link href="/login?mode=signup">{t.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
