import "server-only";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { databaseOptions } from "./config.ts";
import { isStagingDatabase } from "./staging-target.ts";
import { requireReadOnlyAccount } from "./privileges.ts";
export { readOnlyGrants } from "./privileges.ts";

export function stagingTestOptions(
  args: string[],
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  const target = args.find((arg) => arg.startsWith("--database="))?.slice(11);
  if (
    env.DEPLOYMENT_ENV !== "staging" ||
    env.DB_CONNECTION_TEST_ENABLED !== "true" ||
    !args.includes("--confirm") ||
    args.filter((arg) => arg.startsWith("--database=")).length !== 1 ||
    args.some((arg) => !["--confirm", "--schema"].includes(arg) && !arg.startsWith("--database=")) ||
    !target || target !== env.MYSQL_DATABASE ||
    !isStagingDatabase(target) ||
    env.DB_MIGRATIONS_ENABLED === "true" || env.AWIN_IMPORT_ENABLED === "true"
  ) throw new Error("Staging connection test blocked");
  return databaseOptions("read", env);
}

export function supportedDatabase(version: string) {
  // MariaDB can report a 5.5.5 compatibility prefix.
  const clean = version.replace(/^5\.5\.5-/, "");
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(clean);
  if (!match) return false;
  const major = Number(match[1]), minor = Number(match[2]);
  return /MariaDB/i.test(clean)
    ? major > 10 || (major === 10 && minor >= 6)
    : major >= 8;
}

export async function checkStagingConnection(connection: PoolConnection, database: string, schema: boolean) {
  const query = async (sql: string, values: string[] = []) => {
    const [rows] = await connection.execute<RowDataPacket[]>({ sql, timeout: 3000 }, values);
    return rows;
  };
  const identity = await query("SELECT DATABASE() AS database_name, VERSION() AS version, 1 AS connected");
  if (identity[0]?.database_name !== database || !supportedDatabase(String(identity[0]?.version)))
    throw new Error("Database identity or version check failed");
  const privileges = await requireReadOnlyAccount(connection, database);
  if (schema) {
    const tables = ["categories", "retailers", "products", "offers", "prices", "product_images", "affiliate_links", "feed_runs", "schema_migrations"];
    for (const table of tables) await query(`SELECT 1 FROM \`${table}\` LIMIT 0`);
    const history = await query("SELECT version,checksum FROM schema_migrations");
    const directory = resolve("db/migrations");
    const names = (await readdir(directory)).filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name));
    if (history.length !== names.length) throw new Error("Migration history is incomplete");
    for (const name of names) {
      const checksum = createHash("sha256").update(await readFile(resolve(directory, name))).digest("hex");
      if (!history.some((row) => row.version === name && row.checksum === checksum))
        throw new Error("Migration history mismatch");
    }
  }
  return { connection: "ok", version: "supported", privileges, schema: schema ? "verified" : "not-checked" };
}
