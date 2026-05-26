import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { jobRepo } from "@/server/repositories/job";
import { auditLogRepo } from "@/server/repositories/auditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Marks posted jobs whose `expiresAt` has passed as expired.
 * Run hourly via Vercel Cron or external scheduler.
 */
export async function GET(request: NextRequest) {
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("secret");
  if (provided !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const due = await jobRepo.listDueExpired(now);
  for (const j of due) {
    await jobRepo.setStatus(j.id, "expired");
    await auditLogRepo.log({
      actorId: null,
      action: "job.expire",
      targetType: "job",
      targetId: j.id,
      metadata: null,
      ip: null,
      userAgent: "cron",
    });
  }
  return NextResponse.json({ expired: due.length });
}
