import "server-only";

// Live offers are enabled only on the isolated Supabase staging website.
// The existing production and static/demo pages must remain unchanged.
export function stagingLiveCatalogEnabled(env: Readonly<Record<string, string | undefined>> = process.env) {
  return env.DEPLOYMENT_ENV === "staging" &&
    env.CATALOG_BACKEND === "supabase" &&
    env.SUPABASE_CATALOG_ENABLED === "true" &&
    env.CATALOG_SEARCH_ENABLED === "true" &&
    env.DATABASE_ACCESS_ENABLED !== "true" &&
    env.AWIN_IMPORT_ENABLED !== "true" &&
    env.DB_MIGRATIONS_ENABLED !== "true" &&
    env.IMAGE_SEARCH_ENABLED !== "true";
}
