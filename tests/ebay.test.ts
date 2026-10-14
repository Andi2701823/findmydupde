import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/api/ebay/search/route.ts";
import { stagingEbaySearchEnabled } from "../server/catalog/live-mode.ts";

const originalFetch = globalThis.fetch;
const variables = [
  "DEPLOYMENT_ENV", "EBAY_SEARCH_ENABLED", "EBAY_CLIENT_ID", "EBAY_CLIENT_SECRET",
  "EBAY_EPN_CAMPAIGN_ID", "EBAY_MARKETPLACE_ID",
  "DATABASE_ACCESS_ENABLED", "CATALOG_SEARCH_ENABLED",
  "DB_MIGRATIONS_ENABLED", "AWIN_IMPORT_ENABLED", "IMAGE_SEARCH_ENABLED",
];
const originals = Object.fromEntries(variables.map((key) => [key, process.env[key]]));
function setEnv(values: Record<string, string | undefined>) {
  for (const key of variables) delete process.env[key];
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) process.env[key] = value;
  }
}
function request(q = "drone") {
  return new Request("https://staging.example.invalid/api/ebay/search/?q=" + encodeURIComponent(q));
}
const staging = {
  DEPLOYMENT_ENV: "staging", EBAY_SEARCH_ENABLED: "true",
  EBAY_CLIENT_ID: "example-client", EBAY_CLIENT_SECRET: "example-test-secret",
  EBAY_MARKETPLACE_ID: "EBAY_US",
  DATABASE_ACCESS_ENABLED: "false", CATALOG_SEARCH_ENABLED: "false",
  DB_MIGRATIONS_ENABLED: "false", AWIN_IMPORT_ENABLED: "false", IMAGE_SEARCH_ENABLED: "false",
};
const item = {
  itemId: "v1|123|0",
  title: "Example drone",
  image: { imageUrl: "https://i.ebayimg.com/images/g/test/s-l225.jpg" },
  price: { value: "29.98", currency: "USD" },
  itemWebUrl: "https://www.ebay.com/itm/123",
  itemAffiliateWebUrl: "https://www.ebay.com/itm/123?campid=%253CePNCampaignId%253E",
  condition: "New",
  seller: { username: "example" },
  shippingOptions: [{ shippingCost: { value: "0.00", currency: "USD" } }],
};
test.after(() => {
  for (const key of variables) {
    if (originals[key] === undefined) delete process.env[key];
    else process.env[key] = originals[key];
  }
  globalThis.fetch = originalFetch;
});

test("eBay storefront is staging-only and separate from database and import access", () => {
  assert.equal(stagingEbaySearchEnabled(staging), true);
  assert.equal(stagingEbaySearchEnabled({}), false);
  for (const off of [
    { DEPLOYMENT_ENV: "production" }, { EBAY_SEARCH_ENABLED: "false" },
    { CATALOG_SEARCH_ENABLED: "true" }, { DATABASE_ACCESS_ENABLED: "true" },
    { DB_MIGRATIONS_ENABLED: "true" }, { AWIN_IMPORT_ENABLED: "true" },
    { IMAGE_SEARCH_ENABLED: "true" },
  ]) assert.equal(stagingEbaySearchEnabled({ ...staging, ...off }), false);
});

test("eBay remains unavailable in production or without explicit opt-in", async () => {
  globalThis.fetch = async () => { throw new Error("must never fetch"); };
  setEnv({ ...staging, DEPLOYMENT_ENV: "production" });
  assert.equal((await GET(request())).status, 503);
  setEnv({ ...staging, EBAY_SEARCH_ENABLED: "false" });
  assert.equal((await GET(request())).status, 503);
});

test("staging search returns genuine offer data and does not mislabel placeholder affiliate links", async () => {
  setEnv({ ...staging, EBAY_EPN_CAMPAIGN_ID: "1234567890" });
  let tokenCalls = 0;
  let browseCalls = 0;
  globalThis.fetch = async (url, init) => {
    const address = String(url);
    const headers = new Headers(init?.headers);
    assert.equal(init?.cache ?? "no-store", "no-store");
    if (address.endsWith("/oauth2/token")) {
      tokenCalls++;
      assert.match(headers.get("authorization") ?? "", /^Basic /);
      return Response.json({ access_token: "fake-token-for-test", expires_in: 7200 });
    }
    assert.equal(new URL(address).pathname, "/buy/browse/v1/item_summary/search");
    assert.equal(new URL(address).searchParams.get("q"), "drone");
    assert.equal(headers.get("authorization"), "Bearer fake-token-for-test");
    assert.equal(headers.get("x-ebay-c-enduserctx"), "affiliateCampaignId=1234567890");
    browseCalls++;
    return Response.json({ itemSummaries: [item] });
  };
  const reply = await GET(request());
  assert.equal(reply.status, 200);
  assert.equal(reply.headers.get("cache-control"), "no-store");
  const data = await reply.json();
  assert.equal(data.source, "ebay");
  assert.equal(data.marketplace, "EBAY_US");
  assert.equal(data.items.length, 1);
  assert.equal(data.items[0].price, 29.98);
  assert.equal(data.items[0].outboundUrl, item.itemWebUrl);
  assert.equal(data.items[0].affiliate, false);
  assert.equal(tokenCalls, 1);
  assert.equal(browseCalls, 1);
  assert.equal(JSON.stringify(data).includes("example-test-secret"), false);
});

test("only a matching real ePN URL receives an affiliate label", async () => {
  setEnv({ ...staging, EBAY_EPN_CAMPAIGN_ID: "1234567890", EBAY_MARKETPLACE_ID: "EBAY_DE" });
  globalThis.fetch = async (url, init) => {
    assert.equal(new Headers(init?.headers).get("x-ebay-c-marketplace-id"), "EBAY_DE");
    return Response.json({ itemSummaries: [{
      ...item,
      itemWebUrl: "https://www.ebay.de/itm/123",
      itemAffiliateWebUrl: "https://www.ebay.de/itm/123?campid=1234567890",
      price: { value: "49.99", currency: "EUR" },
    }] });
  };
  const reply = await GET(request());
  assert.equal(reply.status, 200);
  const data = await reply.json();
  assert.equal(data.items[0].affiliate, true);
  assert.match(data.items[0].outboundUrl, /campid=1234567890/);
});

test("invalid queries and marketplace configuration fail closed", async () => {
  setEnv(staging);
  assert.equal((await GET(request("x"))).status, 400);
  setEnv({ ...staging, EBAY_MARKETPLACE_ID: "EBAY_GB" });
  assert.equal((await GET(request())).status, 503);
});
