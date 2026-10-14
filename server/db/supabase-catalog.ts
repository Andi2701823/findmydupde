import "server-only";
import type { CatalogSearch } from "../catalog/input.ts";
import { formatCatalogRows, type CatalogRow } from "../catalog/repository.ts";

type Environment = Readonly<Record<string, string | undefined>>;
type RequestFetch = typeof fetch;

export class SupabaseCatalogUnavailable extends Error {
  constructor() {
    super("Supabase catalog is unavailable");
    this.name = "SupabaseCatalogUnavailable";
  }
}

/**
 * Read-only Supabase REST caller. No PostgreSQL admin/service_role key is used
 * anywhere in the web application. The underlying SQL function runs as INVOKER
 * under RLS and has no DML privileges for anon.
 */
export function supabaseCatalogConfig(env: Environment = process.env) {
  if (env.DEPLOYMENT_ENV !== "staging" ||
      env.CATALOG_BACKEND !== "supabase" ||
      env.SUPABASE_CATALOG_ENABLED !== "true" ||
      env.CATALOG_SEARCH_ENABLED !== "true" ||
      env.DATABASE_ACCESS_ENABLED === "true" ||
      env.DB_MIGRATIONS_ENABLED === "true" ||
      env.AWIN_IMPORT_ENABLED === "true" ||
      env.IMAGE_SEARCH_ENABLED === "true")
    throw new SupabaseCatalogUnavailable();
  const rawUrl = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  if (!rawUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(rawUrl) ||
      !key || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) ||
      env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)
    throw new SupabaseCatalogUnavailable();
  return { url: rawUrl.replace(/\/$/, ""), key };
}

export function supabaseSearchUrl(base: string, input: CatalogSearch, maxAgeDays: number) {
  if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 30)
    throw new SupabaseCatalogUnavailable();
  const url = new URL(base + "/rest/v1/rpc/search_catalog");
  url.searchParams.set("p_q", input.q);
  url.searchParams.set("p_sort", input.sort);
  url.searchParams.set("p_limit", String(input.pageSize + 1));
  url.searchParams.set("p_offset", String((input.page - 1) * input.pageSize));
  url.searchParams.set("p_max_age_days", String(maxAgeDays));
  if (input.category) url.searchParams.set("p_category", input.category);
  if (input.color) url.searchParams.set("p_color", input.color);
  if (input.maxPriceMinor !== undefined)
    url.searchParams.set("p_max_price", String(input.maxPriceMinor));
  return url.toString();
}

export async function searchSupabaseCatalog(
  input: CatalogSearch,
  env: Environment = process.env,
  request: RequestFetch = fetch,
) {
  const { url, key } = supabaseCatalogConfig(env);
  const maxAgeDays = Number(env.CATALOG_MAX_AGE_DAYS || "3");
  const endpoint = supabaseSearchUrl(url, input, maxAgeDays);
  let response: Response;
  try {
    response = await request(endpoint, {
      method: "GET",
      headers: { apikey: key, Accept: "application/json", "Cache-Control": "no-store" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
      redirect: "error",
    });
  } catch {
    throw new SupabaseCatalogUnavailable();
  }
  if (!response.ok) throw new SupabaseCatalogUnavailable();
  let rows: unknown;
  try {
    rows = await response.json();
  } catch {
    throw new SupabaseCatalogUnavailable();
  }
  if (!Array.isArray(rows) || rows.length > input.pageSize + 1 ||
      rows.some((row) => !row || typeof row !== "object" || Array.isArray(row) ||
        ["product_id", "offer_id", "title", "description", "category",
         "retailer_id", "retailer_name", "observed_at", "currency", "availability"].some(
          (column) => typeof row[column] !== "string") ||
        (typeof row.amount_minor !== "number" && typeof row.amount_minor !== "string")))
    throw new SupabaseCatalogUnavailable();
  return formatCatalogRows(rows as CatalogRow[], input);
}
