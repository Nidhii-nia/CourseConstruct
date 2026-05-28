import { drizzle } from "drizzle-orm/neon-http";

import { neon } from "@neondatabase/serverless";

const globalForDb = globalThis;

const sql = globalForDb.sql || neon(process.env.DATABASE_URL);
console.log("DB URL:", process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql);
