import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "../db/connection.ts";
import { requireReadOnlyAccount } from "../db/privileges.ts";
import {
  parseSearch,
  InvalidSearch,
  type CatalogSearch,
} from "../catalog/input.ts";
import { catalogRepository, type CatalogRow } from "../catalog/repository.ts";
import { createRateLimiter, requestQuotaKey } from "./rate-limit.ts";
const quota = createRateLimiter();
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
export function productSearchHandler(deps: {
  enabled: () => boolean;
  search: (input: CatalogSearch) => Promise<unknown>;
  allow: (key: string) => boolean;
  trustProxy?: boolean;
}) {
  return async (request: Request) => {
    if (!deps.enabled())
      return Response.json(
        {
          error: "CATALOG_DISABLED",
          message: "Der Produktkatalog ist noch nicht aktiviert.",
        },
        { status: 503, headers },
      );
    if (!deps.allow(requestQuotaKey(request, deps.trustProxy)))
      return Response.json(
        { error: "RATE_LIMITED" },
        { status: 429, headers: { ...headers, "Retry-After": "60" } },
      );
    try {
      if (request.url.length > 2048) throw new InvalidSearch();
      const input = parseSearch(new URL(request.url).searchParams);
      return Response.json(await deps.search(input), { headers });
    } catch (error) {
      if (error instanceof InvalidSearch)
        return Response.json(
          { error: "INVALID_SEARCH", message: error.message },
          { status: 400, headers },
        );
      // Do not serialize driver errors, SQL, connection details, keys or feed records.
      return Response.json(
        {
          error: "CATALOG_UNAVAILABLE",
          message: "Der Katalog ist vorübergehend nicht verfügbar.",
        },
        { status: 503, headers },
      );
    }
  };
}
// Only fixed diagnostic labels are ever logged. Never log raw driver errors,
// SQL statements, credentials, grant text or a request's search term.
const knownStagingFailures = new Set([
  "Database identity rejected",
  "Runtime account must have only SELECT and USAGE grants",
  "Staging compatibility configuration rejected",
  "Staging compatibility authenticated user rejected",
  "Staging compatibility server version rejected",
  "Staging compatibility wildcard grant scope rejected",
  "Staging compatibility grants rejected",
  "Global privileges rejected",
  "Effective schema privileges rejected",
  "Object-specific privileges rejected",
  "Non-versioned schema inventory not established",
  "Non-versioned table definition not established",
]);
const knownDriverCodes = new Set([
  "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "EHOSTUNREACH",
  "ECONNRESET", "PROTOCOL_CONNECTION_LOST", "ER_ACCESS_DENIED_ERROR",
  "ER_DBACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ER_NO_SUCH_TABLE",
  "ER_TABLEACCESS_DENIED_ERROR", "ER_PARSE_ERROR",
  "CERT_HAS_EXPIRED", "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
]);
export function stagingCatalogDiagnosticReason(error: unknown): string {
  if (error && typeof error === "object" && "code" in error &&
      typeof error.code === "string" && knownDriverCodes.has(error.code))
    return error.code;
  if (error instanceof Error && knownStagingFailures.has(error.message))
    return error.message;
  return "unclassified";
}

export const handleProductSearch = productSearchHandler({
  enabled: () =>
    process.env.CATALOG_SEARCH_ENABLED === "true" &&
    process.env.DATABASE_ACCESS_ENABLED === "true",
  allow: quota,
  trustProxy: process.env.TRUST_PROXY_HEADERS === "true",
  async search(input) {
    let stage = "configuration";
    try {
      const database = process.env.MYSQL_DATABASE || "";
      const pool = getDatabase("read");
      stage = "connection";
      const connection = await pool.getConnection();
      try {
        // Check grants and schema on the same physical connection as the catalog query.
        stage = "privileges";
        await requireReadOnlyAccount(connection, database);
        stage = "catalog-query";
        const days = Number(process.env.CATALOG_MAX_AGE_DAYS || 3);
        return await catalogRepository(async (sql, values) => {
          const [rows] = await connection.execute<(CatalogRow & RowDataPacket)[]>({ sql, timeout: 3000 }, values);
          return rows;
        }).search(input, days);
      } finally {
        connection.release();
      }
    } catch (error) {
      if (process.env.DEPLOYMENT_ENV === "staging" && process.env.STAGING_CATALOG_DIAGNOSTICS === "true") {
        console.error("[FindMyDup staging catalog] stage=" + stage +
          " reason=" + stagingCatalogDiagnosticReason(error));
      }
      throw error;
    }
  },
});
