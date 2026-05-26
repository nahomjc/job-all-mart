import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createPresignedUpload, type UploadKind } from "@/lib/r2";
import type { User } from "@/server/db/schema";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  kind: z.enum(["payment", "logo", "attachment"]),
  contentType: z.string().min(3).max(120),
  contentLength: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  let user: User | null = null;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createPresignedUpload({
      kind: parsed.data.kind as UploadKind,
      contentType: parsed.data.contentType,
      contentLength: parsed.data.contentLength,
      userId: user.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to presign" },
      { status: 400 },
    );
  }
}
