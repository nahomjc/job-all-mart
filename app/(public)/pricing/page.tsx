import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Pricing",
  description: "Choose a plan that fits your hiring volume.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/post",
    description: "Try us out with a single free post per 30 days.",
    features: [
      "1 free post / 30 days",
      "Manual moderation in 24h",
      "Standard Telegram reach",
    ],
    cta: "Start free",
  },
  {
    name: "Basic",
    price: "$10",
    cadence: "/post",
    description: "For occasional hiring.",
    features: [
      "Same-day review (typically <2h)",
      "Logo & company branding",
      "Web + Telegram cross-post",
    ],
    cta: "Buy a post",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$25",
    cadence: "/post",
    description: "For high-priority roles.",
    features: [
      "Pinned & featured for 24h",
      "Priority review",
      "Repost after 14 days included",
    ],
    cta: "Boost a post",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    description: "Bulk posts, branding takeover, API access.",
    features: [
      "Bulk submission via API",
      "Dedicated Telegram channel",
      "Account manager",
    ],
    cta: "Contact us",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-3 text-muted-foreground">
          Pay per post. No subscriptions. Get fast manual review and the right
          audience on every job.
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
                    <Check className="mt-0.5 size-4 text-emerald-600" />
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
