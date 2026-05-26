import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { jobRepo } from "@/server/repositories/job";
import { publishJobToTelegram } from "@/lib/telegram/publisher";
import { auditLogRepo } from "@/server/repositories/auditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertCron(req: NextRequest) {
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    req.nextUrl.searchParams.get("secret");
  if (provided !== env.CRON_SECRET) {
    throw new Error("Forbidden");
  }
}

/**
 * Polls for jobs whose `scheduledAt` is due and posts them.
 * Run every 5 minutes via Vercel Cron or external scheduler.
 */
export async function GET(request: NextRequest) {
  try {
    assertCron(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const due = await jobRepo.listDueScheduled(now);

  const results = [];
  for (const job of due) {
    try {
      const result = await publishJobToTelegram(job.id);
      results.push({ jobId: job.id, ok: true, ...result });
      await auditLogRepo.log({
        actorId: null,
        action: "job.post",
        targetType: "job",
        targetId: job.id,
        metadata: { via: "cron" },
        ip: null,
        userAgent: "cron",
      });
    } catch (err) {
      results.push({
        jobId: job.id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ posted: results.length, results });
}
