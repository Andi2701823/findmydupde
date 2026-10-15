import test from "node:test";
import assert from "node:assert/strict";
import {samsungSort,parseEuroCents,validPriceRange,samsungOrdering} from "../lib/samsung-filters.ts";
import {resolveSupabaseCatalogConfig} from "../lib/supabase-public-config.ts";
const publishable="sb_publishable_1234567890abcdefghijkl";
test("price bounds parse euros safely",()=>{
  assert.equal(parseEuroCents("39,90"),3990);
  assert.equal(parseEuroCents("99.9"),9990);
  assert.equal(parseEuroCents("0"),0);
  assert.equal(parseEuroCents(""),null);
  assert.equal(parseEuroCents("-12"),null);
  assert.equal(parseEuroCents("9999999999"),null);
  assert.equal(parseEuroCents("14x"),null);
  assert.equal(validPriceRange(5000,2000),false);
  assert.equal(validPriceRange(null,2000),true);
});
test("sorting is explicitly allowed and deterministic",()=>{
  assert.equal(samsungSort("unexpected"),"name");
  assert.equal(samsungSort("price-desc"),"price-desc");
  assert.equal(samsungOrdering("price-asc"),"price_cents.asc,aw_product_id.asc");
});
test("general Supabase names work while old Samsung names remain compatible",()=>{
  const url="https://bqefygvwuwqjoqkkftiv.supabase.co";
  assert.deepEqual(resolveSupabaseCatalogConfig({SAMSUNG_CATALOG_ENABLED:"true",SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:publishable}),{url,key:publishable});
  assert.deepEqual(resolveSupabaseCatalogConfig({SAMSUNG_CATALOG_ENABLED:"true",SAMSUNG_SUPABASE_URL:url,SAMSUNG_SUPABASE_PUBLISHABLE_KEY:publishable}),{url,key:publishable});
});
test("never enable unconfigured or secret-key runtime",()=>{
  const url="https://bqefygvwuwqjoqkkftiv.supabase.co";
  assert.equal(resolveSupabaseCatalogConfig({SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:publishable}),null);
  assert.equal(resolveSupabaseCatalogConfig({SAMSUNG_CATALOG_ENABLED:"true",SUPABASE_URL:url,SUPABASE_PUBLISHABLE_KEY:"sb_secret_1234567890"}),null);
  assert.equal(resolveSupabaseCatalogConfig({SAMSUNG_CATALOG_ENABLED:"true",SUPABASE_URL:"https://example.org",SUPABASE_PUBLISHABLE_KEY:publishable}),null);
});
