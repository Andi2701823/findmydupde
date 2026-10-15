import test from "node:test";
import assert from "node:assert/strict";
import {resolveSupabaseReadOnlyConfig,resolveSupabaseCatalogConfig} from "../lib/supabase-public-config.ts";
import {euroCents,joybuySort,validJoybuyCategory,cleanJoybuySearch} from "../lib/joybuy-catalog-helpers.ts";
const url="https://bqefygvwuwqjoqkkftiv.supabase.co";
const key="sb_publishable_abcdefghij0123456789";
test("shared read config works even if Samsung is disabled",()=>{
  assert.deepEqual(resolveSupabaseReadOnlyConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:key,SAMSUNG_CATALOG_ENABLED:"false"}),{url,key});
  assert.equal(resolveSupabaseCatalogConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:key,SAMSUNG_CATALOG_ENABLED:"false"}),null);
});
test("reuses old Samsung keys safely; rejects secrets",()=>{
  assert.deepEqual(resolveSupabaseReadOnlyConfig({SAMSUNG_SUPABASE_URL:url,SAMSUNG_SUPABASE_PUBLISHABLE_KEY:key}),{url,key});
  assert.equal(resolveSupabaseReadOnlyConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:"sb_secret_no"}),null);
});
test("parse price, category and safe queries",()=>{
  assert.equal(euroCents("19,95"),1995);
  assert.equal(euroCents("5"),500);
  assert.equal(euroCents("-20"),null);
  assert.equal(euroCents("20abc"),null);
  assert.equal(joybuySort("price-desc"),"price-desc");
  assert.equal(joybuySort("random"),"name");
  assert.equal(validJoybuyCategory("Technik"),true);
  assert.equal(validJoybuyCategory("SQL"),false);
  assert.equal(cleanJoybuySearch("LED' OR 1=1"),"LED OR 1 1");
});
