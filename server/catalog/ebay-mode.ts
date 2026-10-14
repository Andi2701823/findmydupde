import "server-only";

// Explicit second opt-in prevents accidental eBay activation on the live site.
export function ebaySearchEnabled(env: Readonly<Record<string, string | undefined>> = process.env): boolean {
  const allowed = env.DEPLOYMENT_ENV === "staging" ||
    (env.DEPLOYMENT_ENV === "production" && env.EBAY_PRODUCTION_ENABLED === "true");
  return allowed && env.EBAY_SEARCH_ENABLED === "true" &&
    env.DATABASE_ACCESS_ENABLED !== "true" &&
    env.CATALOG_SEARCH_ENABLED !== "true" &&
    env.DB_MIGRATIONS_ENABLED !== "true" &&
    env.AWIN_IMPORT_ENABLED !== "true" &&
    env.IMAGE_SEARCH_ENABLED !== "true";
}
