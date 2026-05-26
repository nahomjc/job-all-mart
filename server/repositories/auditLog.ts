import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  auditLogs,
  type AuditLog,
} from "@/server/db/schema";

type NewAuditLog = Omit<AuditLog, "id" | "createdAt">;

export const auditLogRepo = {
  log(entry: NewAuditLog) {
    return db.insert(auditLogs).values(entry).returning().then(r => r[0]!);
  },

  list(limit = 100, offset = 0) {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  },
};
