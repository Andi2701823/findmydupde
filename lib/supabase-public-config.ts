/**
 * Shared read-only catalog connection. New partners can reuse SUPABASE_*.
 * Existing SAMSUNG_SUPABASE_* settings still work during migration.
 * A publishable key is required; service_role and secret keys are rejected.
 */
export type CatalogEnvironment = {
  SAMSUNG_CATALOG_ENABLED?: string;
  JOYBUY_CATALOG_ENABLED?: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SAMSUNG_SUPABASE_URL?: string;
  SAMSUNG_SUPABASE_PUBLISHABLE_KEY?: string;
};
export function resolveSupabaseReadOnlyConfig(env: CatalogEnvironment) {
  const url=(env.SUPABASE_URL || env.SAMSUNG_SUPABASE_URL || "").trim().replace(/\/$/,"");
  const key=(env.SUPABASE_PUBLISHABLE_KEY || env.SAMSUNG_SUPABASE_PUBLISHABLE_KEY || "").trim();
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))return null;
  if(!/^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(key)||key.length>512)return null;
  return {url,key};
}

export function resolveSupabaseCatalogConfig(env:CatalogEnvironment) {
  if(env.SAMSUNG_CATALOG_ENABLED!=="true")return null;
  return resolveSupabaseReadOnlyConfig(env);
}
