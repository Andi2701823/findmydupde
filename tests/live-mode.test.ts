import test from "node:test";
import assert from "node:assert/strict";
import { stagingLiveCatalogEnabled } from "../server/catalog/live-mode.ts";

const staging = {
  DEPLOYMENT_ENV: "staging",
  CATALOG_BACKEND: "supabase",
  SUPABASE_CATALOG_ENABLED: "true",
  CATALOG_SEARCH_ENABLED: "true",
  DATABASE_ACCESS_ENABLED: "false",
  AWIN_IMPORT_ENABLED: "false",
  DB_MIGRATIONS_ENABLED: "false",
  IMAGE_SEARCH_ENABLED: "false",
};

test("real storefront search only activates for explicitly allowed Supabase staging", () => {
  assert.equal(stagingLiveCatalogEnabled(staging), true);
  assert.equal(stagingLiveCatalogEnabled({}), false);
  for (const off of [
    { DEPLOYMENT_ENV: "production" }, { DEPLOYMENT_ENV: undefined },
    { CATALOG_BACKEND: "mysql" }, { CATALOG_BACKEND: undefined },
    { SUPABASE_CATALOG_ENABLED: "false" }, { CATALOG_SEARCH_ENABLED: "false" },
    { DATABASE_ACCESS_ENABLED: "true" }, { AWIN_IMPORT_ENABLED: "true" },
    { DB_MIGRATIONS_ENABLED: "true" }, { IMAGE_SEARCH_ENABLED: "true" },
  ]) assert.equal(stagingLiveCatalogEnabled({ ...staging, ...off }), false);
});
