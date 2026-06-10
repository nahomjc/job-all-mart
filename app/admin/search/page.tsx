import Link from "next/link";
import { ArrowRight, Briefcase, Receipt, Search, Users } from "lucide-react";
import { AdminUserCell } from "@/components/admin/admin-user-cell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime, statusLabel } from "@/lib/format";
import { adminSearchRepo } from "@/server/repositories/admin-search";

export const metadata = { title: "Search" };

interface SearchParams {
	q?: string;
}

export default async function AdminSearchPage(props: {
	searchParams: Promise<SearchParams>;
}) {
	const sp = await props.searchParams;
	const q = (sp.q ?? "").trim();
	const results = q ? await adminSearchRepo.search(q) : { jobs: [], users: [], payments: [] };
	const hasQuery = q.length > 0;
	const total = results.jobs.length + results.users.length + results.payments.length;

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Admin"
				title="Search"
				description="Find jobs, users, and payments across the platform."
			/>

			{!hasQuery ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
						<span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<Search className="size-6" />
						</span>
						<p className="text-sm text-muted-foreground">
							Use the search bar above to look up jobs, users, or payments.
						</p>
					</CardContent>
				</Card>
			) : total === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
						<span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
							<Search className="size-6" />
						</span>
						<p className="font-medium">No results for &ldquo;{q}&rdquo;</p>
						<p className="text-sm text-muted-foreground">
							Try a different title, email, reference code, or company name.
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					<p className="text-sm text-muted-foreground">
						{total} result{total === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
					</p>

					{results.jobs.length > 0 && (
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
								<div className="flex items-center gap-2">
									<Briefcase className="size-4 text-muted-foreground" />
									<CardTitle className="text-base">Jobs</CardTitle>
									<Badge variant="secondary">{results.jobs.length}</Badge>
								</div>
								<Button asChild variant="ghost" size="sm">
									<Link href={`/admin/jobs?q=${encodeURIComponent(q)}`}>
										View all <ArrowRight className="size-3.5" />
									</Link>
								</Button>
							</CardHeader>
							<CardContent className="divide-y p-0">
								{results.jobs.map(({ job, employer, category }) => (
									<Link
										key={job.id}
										href={`/admin/jobs/${job.id}`}
										className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-muted/40"
									>
										<div className="min-w-0">
											<p className="truncate font-medium">{job.title}</p>
											<p className="truncate text-sm text-muted-foreground">
												{job.company}
												{employer?.displayName && ` · ${employer.displayName}`}
												{category?.name && ` · ${category.name}`}
											</p>
										</div>
										<div className="flex shrink-0 items-center gap-2">
											<Badge>{statusLabel(job.status)}</Badge>
											<span className="hidden text-xs text-muted-foreground sm:inline">
												{formatRelativeTime(job.createdAt)}
											</span>
										</div>
									</Link>
								))}
							</CardContent>
						</Card>
					)}

					{results.users.length > 0 && (
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
								<div className="flex items-center gap-2">
									<Users className="size-4 text-muted-foreground" />
									<CardTitle className="text-base">Users</CardTitle>
									<Badge variant="secondary">{results.users.length}</Badge>
								</div>
								<Button asChild variant="ghost" size="sm">
									<Link href={`/admin/users?q=${encodeURIComponent(q)}`}>
										View all <ArrowRight className="size-3.5" />
									</Link>
								</Button>
							</CardHeader>
							<CardContent className="divide-y p-0">
								{results.users.map(({ user, companyLogoUrl }) => (
									<div key={user.id} className="px-6 py-4">
										<AdminUserCell
											user={user}
											companyLogoUrl={companyLogoUrl}
											href={`/admin/users/${user.id}`}
										/>
									</div>
								))}
							</CardContent>
						</Card>
					)}

					{results.payments.length > 0 && (
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
								<div className="flex items-center gap-2">
									<Receipt className="size-4 text-muted-foreground" />
									<CardTitle className="text-base">Payments</CardTitle>
									<Badge variant="secondary">{results.payments.length}</Badge>
								</div>
								<Button asChild variant="ghost" size="sm">
									<Link href={`/admin/payments?q=${encodeURIComponent(q)}`}>
										View all <ArrowRight className="size-3.5" />
									</Link>
								</Button>
							</CardHeader>
							<CardContent className="divide-y p-0">
								{results.payments.map(({ payment: p }) => (
									<Link
										key={p.id}
										href={`/admin/jobs/${p.jobId}`}
										className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-muted/40"
									>
										<div className="min-w-0">
											<p className="font-medium">
												{p.amount} {p.currency}
											</p>
											<p className="truncate text-sm text-muted-foreground">
												{statusLabel(p.method)}
												{p.referenceCode && ` · ${p.referenceCode}`}
											</p>
										</div>
										<div className="flex shrink-0 items-center gap-2">
											<Badge>{statusLabel(p.status)}</Badge>
											<span className="hidden text-xs text-muted-foreground sm:inline">
												{formatRelativeTime(p.createdAt)}
											</span>
										</div>
									</Link>
								))}
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	);
}
