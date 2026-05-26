import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

declare global {
  var __pg: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__pg ??
  postgres(env.DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    prepare: false, // required for Supabase pooled (Transaction) URIs
  });

if (process.env.NODE_ENV !== "production") global.__pg = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export type DB = typeof db;
