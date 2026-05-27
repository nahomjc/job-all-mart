import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Globe,
  Handshake,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/job-card";
import { jobRepo } from "@/server/repositories/job";
import { categoryRepo } from "@/server/repositories/category";
import { requiredChannelJoinUrl } from "@/lib/telegram/required-channel";

const TRUSTED_BRANDS = [
  "zendesk",
  "BuzzFeed",
  "mollie",
  "Dropbox",
  "Stripe",
  "Shopify",
];

const CATEGORY_THEMES = [
  {
    accent: "bg-amber-400",
    iconBg: "bg-amber-100 text-amber-700",
    icon: Briefcase,
  },
  {
    accent: "bg-pink-400",
    iconBg: "bg-pink-100 text-pink-700",
    icon: Wallet,
  },
  {
    accent: "bg-sky-400",
    iconBg: "bg-sky-100 text-sky-700",
    icon: TrendingUp,
  },
  {
    accent: "bg-orange-400",
    iconBg: "bg-orange-100 text-orange-700",
    icon: Users,
  },
  {
    accent: "bg-violet-400",
    iconBg: "bg-violet-100 text-violet-700",
    icon: Globe,
  },
  {
    accent: "bg-emerald-400",
    iconBg: "bg-emerald-100 text-emerald-700",
    icon: Sparkles,
  },
];

export default async function HomePage() {
  const [recent, categories] = await Promise.all([
    jobRepo.listPublic({ limit: 6 }),
    categoryRepo.list(),
  ]);

  const featuredCategories = categories.slice(0, 4);

  return (
    <div className="overflow-hidden">
      {/* ─────────── Hero ─────────── */}
      <section className="relative isolate">
        {/* subtle grid + soft glow background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/15 via-background to-background"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[linear-gradient(to_right,oklch(0.92_0.004_286.32/.5)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.004_286.32/.5)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]"
        />

        <div className="container mx-auto grid items-center gap-12 px-4 pb-12 pt-16 md:pt-24 lg:grid-cols-2 lg:gap-8 lg:pb-20">
          {/* Left: copy + search */}
          <div className="relative z-10 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Live · Telegram + Web · Moderated
            </span>

            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Gateway to Exciting Jobs
              <br />
              and{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">Global Vacancies</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-sm bg-primary/30"
                />
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground md:text-lg lg:mx-0">
              From remote work to on-site positions, find the career that truly
              fits you. Browse curated listings and apply directly to employers
              who are ready to hire.
            </p>

            {/* Search bar */}
            <form
              action="/jobs"
              method="get"
              className="mt-8 flex flex-col gap-2 rounded-2xl border bg-background/80 p-2 shadow-lg shadow-primary/5 backdrop-blur sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search jobs, salary, or companies..."
                  className="h-12 border-0 bg-transparent pl-11 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-xl px-6 sm:rounded-full"
              >
                Explore Now
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login?mode=signup">
                  Post a job <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <span className="text-muted-foreground/60">·</span>
              <Button asChild variant="ghost" size="sm">
                <a
                  href={requiredChannelJoinUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="size-3.5" />
                  Telegram bot
                </a>
              </Button>
            </div>
          </div>

          {/* Right: visual */}
          <div className="relative mx-auto hidden h-[520px] w-full max-w-[580px] lg:block">
            {/* Backdrop blob */}
            <div
              aria-hidden="true"
              className="absolute inset-x-6 inset-y-2 rounded-[3rem] bg-linear-to-br from-primary/85 via-primary to-primary/60 shadow-2xl shadow-primary/30"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-6 inset-y-2 overflow-hidden rounded-[3rem]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.15),transparent_45%)]" />
            </div>

            {/* Professional team photo */}
            <div className="absolute inset-x-6 inset-y-2 overflow-hidden rounded-[3rem]">
              <Image
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
                alt="Diverse team of smiling professionals"
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[center_30%]"
              />
              {/* Soft green tint to blend with brand */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-primary/40 via-transparent to-transparent mix-blend-multiply"
              />
            </div>

            {/* Floating stat: Companies (top-left) */}
            <div className="absolute -left-4 top-10 flex items-center gap-3 rounded-2xl border bg-background/95 p-3 pr-5 shadow-xl shadow-black/5 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <Building2 className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-none">10,000+</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Trusted employers
                </p>
              </div>
            </div>

            {/* Floating stat: 2x Faster (top-right) */}
            <div className="absolute -right-2 top-24 flex items-center gap-3 rounded-2xl border bg-background/95 p-3 pr-5 shadow-xl shadow-black/5 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Zap className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-none">2x Faster</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quicker job discovery
                </p>
              </div>
            </div>

            {/* Floating stat: Visits (bottom-left) */}
            <div className="absolute -left-2 bottom-16 flex items-center gap-3 rounded-2xl border bg-background/95 p-3 pr-5 shadow-xl shadow-black/5 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <TrendingUp className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-none">250,000+</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Monthly job seekers
                </p>
              </div>
            </div>

            {/* Floating stat: Jobs (right-middle) */}
            <div className="absolute -right-4 bottom-32 flex items-center gap-3 rounded-2xl border bg-background/95 p-3 pr-5 shadow-xl shadow-black/5 backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Briefcase className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-none">1,500+ Jobs</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Curated listings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted brands strip */}
        <div className="relative bg-primary py-5">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]"
          />
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-primary-foreground/95">
            {TRUSTED_BRANDS.map((brand) => (
              <span
                key={brand}
                className="text-lg font-bold tracking-tight opacity-90"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Build Your Career ─────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Build Your Career in Just a Few Steps
            </h2>
          </div>
          <p className="text-pretty text-base text-muted-foreground">
            From posting jobs to hiring top talent, our platform makes the
            entire process simple, fast, and effective. We connect employers
            with skilled professionals, provide secure transactions, and ensure
            every step is human-reviewed.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Briefcase,
              tint: "bg-rose-100 text-rose-600",
              title: "Post Opportunities",
              body:
                "Easily publish your job openings and start receiving applications from skilled candidates within minutes of approval.",
            },
            {
              icon: Users,
              tint: "bg-violet-100 text-violet-600",
              title: "Find Top Talent",
              body:
                "Search and connect with skilled professionals who match your company's needs across Telegram and the open web.",
            },
            {
              icon: Shield,
              tint: "bg-sky-100 text-sky-600",
              title: "Secure Transactions",
              body:
                "Enjoy a safe and reliable payment process for every hire and collaboration — verified by a real human.",
            },
          ].map(({ icon: Icon, tint, title, body }) => (
            <Card
              key={title}
              className="border-transparent bg-muted/30 transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-background hover:shadow-lg"
            >
              <CardContent className="p-6">
                <span
                  className={`flex size-12 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────── Popular Categories ─────────── */}
      {featuredCategories.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Popular categories
                </p>
                <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                  Discover jobs across top industries
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/jobs">
                  Browse all <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCategories.map((c, i) => {
                const theme = CATEGORY_THEMES[i % CATEGORY_THEMES.length];
                const Icon = theme.icon;
                return (
                  <Card
                    key={c.id}
                    className="group relative overflow-hidden border-transparent bg-background transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className={`h-1.5 w-full ${theme.accent}`} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex size-10 items-center justify-center rounded-lg ${theme.iconBg}`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <button
                          type="button"
                          aria-label="Save category"
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Bookmark className="size-4" />
                        </button>
                      </div>
                      <h3 className="mt-3 line-clamp-1 text-base font-semibold">
                        {c.name}
                      </h3>
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          Remote · Global
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="size-3.5" />
                          Full time
                        </div>
                      </div>
                      <Button
                        asChild
                        className="mt-4 w-full"
                        size="sm"
                      >
                        <Link href={`/jobs?category=${c.slug}`}>
                          Apply Now
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── How It Works ─────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Visual */}
          <div className="relative mx-auto h-[460px] w-full max-w-md">
            <div
              aria-hidden="true"
              className="absolute -left-6 -top-6 size-32 rounded-3xl bg-amber-100/70 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -right-6 size-40 rounded-3xl bg-primary/20 blur-2xl"
            />
            <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl shadow-black/10">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80"
                alt="Professional working at her desk"
                fill
                sizes="(min-width: 1024px) 448px, 100vw"
                className="object-cover"
              />
            </div>

            {/* Floating stat: views */}
            <div className="absolute -left-4 bottom-10 flex items-center gap-3 rounded-2xl border bg-background p-3 pr-5 shadow-xl">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <TrendingUp className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-none">12,567</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Views <span className="font-medium text-emerald-600">+50%</span>
                </p>
              </div>
            </div>

            {/* Floating stat: hires */}
            <div className="absolute -right-3 top-10 flex items-center gap-3 rounded-2xl border bg-background p-3 pr-5 shadow-xl">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-base font-bold leading-none">98%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Successful hires
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              How it works
            </p>
            <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              How {process.env.NEXT_PUBLIC_APP_NAME ?? "JobBridge"} Works.
            </h2>
            <p className="mt-3 max-w-md text-pretty text-muted-foreground">
              A simple way to take the next step in your career — from finding
              the right job to connecting with employers, everything happens in
              just a few easy steps.
            </p>

            <ol className="relative mt-8 space-y-6">
              <span
                aria-hidden="true"
                className="absolute left-7 top-8 bottom-8 w-px border-l-2 border-dashed border-primary/30"
              />
              {[
                {
                  n: "01",
                  title: "Search and Apply",
                  body:
                    "Browse thousands of job opportunities that match your skills and interests.",
                },
                {
                  n: "02",
                  title: "Connect and Interview",
                  body:
                    "Once your application is accepted, connect directly with recruiters or employers to schedule.",
                },
                {
                  n: "03",
                  title: "Grow Your Career",
                  body:
                    "Land your dream job and keep growing with new opportunities and valuable experiences.",
                },
              ].map(({ n, title, body }) => (
                <li
                  key={n}
                  className="relative flex items-start gap-5 rounded-2xl"
                >
                  <span className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-background text-lg font-bold text-primary">
                    {n}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 max-w-md text-sm text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─────────── Latest Jobs ─────────── */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Latest opportunities
              </p>
              <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Fresh openings, posted today
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hand-picked roles from verified employers across our channels.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/jobs">
                See all jobs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                No jobs posted yet — be the first.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recent.map(({ job, category }) => (
                <JobCard key={job.id} job={job} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────── Why us strip ─────────── */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Moderated submissions",
              body:
                "Every post goes through admin review. Spam filters catch obvious abuse and AI signals flag risky content.",
            },
            {
              icon: CheckCircle2,
              title: "Payment-verified posts",
              body:
                "Posts go live only after a human approves the payment — no chargebacks, no fakes.",
            },
            {
              icon: Zap,
              title: "Instant publishing",
              body:
                "Once approved, your job is sent straight to the right Telegram category topic in under 60 seconds.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border bg-background p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── Final CTA ─────────── */}
      <section className="container mx-auto px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-primary-foreground md:p-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_50%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -right-10 size-64 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                <Handshake className="size-3.5" />
                Hire faster, hire smarter
              </span>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Ready to post your next role?
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-primary-foreground/90">
                Reach thousands of vetted candidates on Telegram and the open
                web. Every post is human-reviewed and payment-verified before
                going live.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
              >
                <Link href="/login?mode=signup">
                  Post a job <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <a
                  href={requiredChannelJoinUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="size-4" /> Telegram bot
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
