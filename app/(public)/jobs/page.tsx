import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/job-card";
import { jobRepo } from "@/server/repositories/job";
import { categoryRepo } from "@/server/repositories/category";

export const metadata = {
  title: "Browse jobs",
  description: "Browse the latest job listings.",
};

interface SearchParams {
  q?: string;
  category?: string;
  type?: string;
  page?: string;
}

export default async function JobsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const page = Math.max(1, Number(sp.page ?? "1"));
  const pageSize = 12;
  const offset = (page - 1) * pageSize;

  const categories = await categoryRepo.list();
  const category = sp.category ? categories.find((c) => c.slug === sp.category) : null;

  const rows = await jobRepo.listPublic({
    limit: pageSize,
    offset,
    q: sp.q || undefined,
    categoryId: category?.id,
    employmentType: (sp.type as never) || undefined,
  });

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <form action="/jobs" method="get" className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Title, company, keyword..."
              className="pl-8"
            />
          </div>
          {sp.category && (
            <input type="hidden" name="category" value={sp.category} />
          )}
          <Button type="submit" className="w-full" size="sm">
            Search
          </Button>
        </form>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Categories</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/jobs"
                className={!sp.category ? "font-semibold" : "text-muted-foreground hover:text-foreground"}
              >
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/jobs?category=${c.slug}`}
                  className={
                    sp.category === c.slug
                      ? "font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Employment type</h3>
          <div className="flex flex-wrap gap-1">
            {(["full_time", "part_time", "contract", "internship", "remote"] as const).map(
              (t) => (
                <Link
                  key={t}
                  href={`/jobs?type=${t}${sp.category ? `&category=${sp.category}` : ""}`}
                >
                  <Badge
                    variant={sp.type === t ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {t.replace("_", " ")}
                  </Badge>
                </Link>
              ),
            )}
          </div>
        </div>
      </aside>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {category ? category.name : "All jobs"}
              {sp.q && <span className="text-muted-foreground"> · &ldquo;{sp.q}&rdquo;</span>}
            </h1>
            <p className="text-sm text-muted-foreground">
              {rows.length} {rows.length === 1 ? "result" : "results"} on this page
            </p>
          </div>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-sm text-muted-foreground">
              No jobs match your filters yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rows.map(({ job, category: cat }) => (
              <JobCard key={job.id} job={job} category={cat} />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: "/jobs",
                  query: { ...sp, page: page - 1 },
                }}
              >
                ← Previous
              </Link>
            </Button>
          ) : <span />}
          {rows.length === pageSize ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: "/jobs",
                  query: { ...sp, page: page + 1 },
                }}
              >
                Next →
              </Link>
            </Button>
          ) : <span />}
        </div>
      </section>
    </div>
  );
}
