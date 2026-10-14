import "server-only";
import { isStagingDatabase } from "./staging-target.ts";
export type DatabaseRole = "read" | "import" | "migration";
export class DatabaseUnavailable extends Error {
  constructor() {
    super("Database access is not configured or enabled.");
    this.name = "DatabaseUnavailable";
  }
}
function required(
  env: Readonly<Record<string, string | undefined>>,
  name: string,
): string {
  const value = env[name];
  if (!value || value === "replace_me" || value.includes("your_password"))
    throw new DatabaseUnavailable();
  return value;
}
function integer(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const n = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(n) || n < min || n > max)
    throw new DatabaseUnavailable();
  return n;
}
export function databaseOptions(
  role: DatabaseRole,
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  // Production catalog/database activation needs a separate, explicitly reviewed release.
  // This staging-to-production preparation is intentionally demo-only and must never
  // connect to the existing production MySQL database, even with accidentally enabled flags.
  if (env.DEPLOYMENT_ENV === "production") throw new DatabaseUnavailable();
  if (env.DATABASE_ACCESS_ENABLED !== "true") throw new DatabaseUnavailable();
  if (role === "migration" && env.DB_MIGRATIONS_ENABLED !== "true")
    throw new DatabaseUnavailable();
  if (role === "import" && env.AWIN_IMPORT_ENABLED !== "true")
    throw new DatabaseUnavailable();
  const host = required(env, "MYSQL_HOST");
  const database = required(env, "MYSQL_DATABASE");
  if (!/^[a-zA-Z0-9_]{1,64}$/.test(database)) throw new DatabaseUnavailable();
  // Applies to read, migration and import roles, before any pool/connection exists.
  if (env.DEPLOYMENT_ENV === "staging" && !isStagingDatabase(database))
    throw new DatabaseUnavailable();
  const local = ["localhost", "127.0.0.1", "::1"].includes(host);
  const tls = env.MYSQL_TLS_MODE || (local ? "disabled" : "required");
  if (!["required", "disabled"].includes(tls) || (!local && tls !== "required"))
    throw new DatabaseUnavailable();
  const prefix =
    role === "read"
      ? "MYSQL"
      : role === "import"
        ? "MYSQL_IMPORT"
        : "MYSQL_MIGRATION";
  return {
    host,
    database,
    port: integer(env.MYSQL_PORT, 3306, 1, 65535),
    user: required(env, prefix + "_USER"),
    password: required(env, prefix + "_PASSWORD"),
    connectionLimit: integer(env.MYSQL_CONNECTION_LIMIT, 2, 1, 5),
    maxIdle: 1,
    idleTimeout: 30000,
    waitForConnections: true,
    queueLimit: 8,
    connectTimeout: 5000,
    maxPreparedStatements: 100,
    multipleStatements: false,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    ...(tls === "required"
      ? {
          ssl: {
            rejectUnauthorized: true,
            ...(env.MYSQL_SSL_CA
              ? { ca: env.MYSQL_SSL_CA.replace(/\\n/g, "\n") }
              : {}),
          },
        }
      : {}),
  };
}
