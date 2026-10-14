import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseSearch } from "../server/catalog/input.ts";
import {
  searchSupabaseCatalog, supabaseCatalogConfig, supabaseSearchUrl,
} from "../server/db/supabase-catalog.ts";

const env = {
  DEPLOYMENT_ENV: "staging", CATALOG_BACKEND: "supabase",
  SUPABASE_CATALOG_ENABLED: "true", CATALOG_SEARCH_ENABLED: "true",
  DATABASE_ACCESS_ENABLED: "false", DB_MIGRATIONS_ENABLED: "false",
  AWIN_IMPORT_ENABLED: "false", IMAGE_SEARCH_ENABLED: "false",
  SUPABASE_URL: "https://findmydup-test.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_testfixture",
};
const search = parseSearch(new URLSearchParams("q=tasche&sort=price-asc&page=2&pageSize=3"));
test("Supabase backend is staging-only, read-only and strictly opt-in", () => {
  assert.equal(supabaseCatalogConfig(env).url, env.SUPABASE_URL);
  for (const override of [
    { DEPLOYMENT_ENV: "production" },
    { CATALOG_BACKEND: "mysql" }, { SUPABASE_CATALOG_ENABLED: "false" },
    { CATALOG_SEARCH_ENABLED: "false" }, { DATABASE_ACCESS_ENABLED: "true" },
    { DB_MIGRATIONS_ENABLED: "true" }, { AWIN_IMPORT_ENABLED: "true" },
    { IMAGE_SEARCH_ENABLED: "true" },
    { SUPABASE_URL: "http://findmydup-test.supabase.co" },
    { SUPABASE_URL: "https://example.com" },
    { SUPABASE_URL: "https://findmydup-test.supabase.co.evil.test" },
    { SUPABASE_PUBLISHABLE_KEY: "sb_secret_private" },
    { SUPABASE_SERVICE_ROLE_KEY: "service-key" },
    { SUPABASE_SECRET_KEY: "another-secret" },
  ]) assert.throws(() => supabaseCatalogConfig({ ...env, ...override }));
  assert.throws(() => supabaseCatalogConfig({}));
});

test("Supabase RPC URL encodes all bounded search filters", () => {
  const input = parseSearch(new URLSearchParams({
    q: "glitzer%'&tasche", category: "mode", color: "schwarz",
    maxPrice: "50.99", sort: "recent", page: "2", pageSize: "12",
  }));
  const url = new URL(supabaseSearchUrl(env.SUPABASE_URL, input, 3));
  assert.equal(url.pathname, "/rest/v1/rpc/search_catalog");
  assert.equal(url.searchParams.get("p_q"), input.q);
  assert.equal(url.searchParams.get("p_category"), "mode");
  assert.equal(url.searchParams.get("p_color"), "schwarz");
  assert.equal(url.searchParams.get("p_max_price"), "5099");
  assert.equal(url.searchParams.get("p_limit"), "13");
  assert.equal(url.searchParams.get("p_offset"), "12");
  assert.equal(url.searchParams.get("p_max_age_days"), "3");
  assert.throws(() => supabaseSearchUrl(env.SUPABASE_URL!, input, 31));
});

test("Supabase reads published offers over GET with a publishable key only", async () => {
  let calls = 0;
  const fakeFetch = (async (requestUrl: string | URL | Request, options?: RequestInit) => {
    calls++;
    assert.equal(String(requestUrl).includes("p_q=tasche"), true);
    assert.equal(options?.method, "GET");
    assert.equal(new Headers(options?.headers).get("apikey"), env.SUPABASE_PUBLISHABLE_KEY);
    assert.equal(new Headers(options?.headers).get("authorization"), null);
    assert.equal(options?.cache, "no-store");
    return Response.json([{
      product_id: "00000000-0000-0000-0000-000000000001",
      offer_id: "00000000-0000-0000-0000-000000000002",
      title: "Test Tasche", description: "", category: "mode",
      color: null, material: null,
      retailer_id: "00000000-0000-0000-0000-000000000003",
      retailer_name: "Test retailer", image_url: null,
      amount_minor: 1299, currency: "EUR",
      observed_at: "2026-10-14T09:00:00.000Z",
      availability: "in_stock", affiliate_url: null,
    }]);
  }) as typeof fetch;
  const response = await searchSupabaseCatalog(search, env, fakeFetch);
  assert.equal(calls, 1);
  assert.equal(response.source, "catalog");
  assert.equal(response.offers.length, 1);
  assert.equal(response.offers[0].price.amountMinor, 1299);
  assert.equal(response.offers[0].price.observedAt, "2026-10-14T09:00:00.000Z");
});

test("unavailable Supabase does not expose upstream errors or malformed data", async () => {
  const remote = (response: Response) => (async () => response) as typeof fetch;
  for (const response of [
    new Response("secret service message", { status: 403 }),
    Response.json({ error: "secret SQL" }),
    Response.json(Array(5).fill({})),
    Response.json([{ product_id: "abc" }]),
  ]) {
    await assert.rejects(() => searchSupabaseCatalog(search, env, remote(response)),
      /Supabase catalog is unavailable/);
  }
  await assert.rejects(() => searchSupabaseCatalog(search, env,
    (async () => { throw new Error("private backend key"); }) as typeof fetch),
    /Supabase catalog is unavailable/);
});

test("staging SQL migration requires RLS, no anonymous writes, and invoker search", async () => {
  const sql = await readFile("db/supabase/001_catalog.sql", "utf8");
  assert.match(sql, /alter table public\.catalog_offers enable row level security/i);
  assert.match(sql, /for select to anon using \(published = true\)/i);
  assert.match(sql, /revoke all privileges on table public\.catalog_offers from public, anon, authenticated/i);
  assert.match(sql, /security invoker/i);
  assert.match(sql, /grant execute on function public\.search_catalog/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) .* to anon/i);
  assert.doesNotMatch(sql, /create (table|function) .*prod/i);
});
