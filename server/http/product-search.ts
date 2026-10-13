import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "../db/connection.ts";
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
export const handleProductSearch = productSearchHandler({
  enabled: () =>
    process.env.CATALOG_SEARCH_ENABLED === "true" &&
    process.env.DATABASE_ACCESS_ENABLED === "true",
  allow: quota,
  trustProxy: process.env.TRUST_PROXY_HEADERS === "true",
  async search(input) {
    const days = Number(process.env.CATALOG_MAX_AGE_DAYS || 3);
    return catalogRepository(async (sql, values) => {
      const [rows] = await getDatabase("read").execute<
        (CatalogRow & RowDataPacket)[]
      >({ sql, timeout: 3000 }, values);
      return rows;
    }).search(input, days);
  },
});
