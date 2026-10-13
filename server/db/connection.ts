import "server-only";
import mysql, { type Pool } from "mysql2/promise";
import { databaseOptions, type DatabaseRole } from "./config.ts";
const pools = new Map<DatabaseRole, Pool>();
export function getDatabase(role: DatabaseRole = "read") {
  // Re-check access flags even when an existing pool is cached. No connection at import/build time.
  const options = databaseOptions(role);
  let pool = pools.get(role);
  if (!pool) {
    pool = mysql.createPool(options);
    pools.set(role, pool);
  }
  return pool;
}
export async function closeDatabases() {
  await Promise.all([...pools.values()].map((p) => p.end()));
  pools.clear();
}
