import test from "node:test";
import assert from "node:assert/strict";
import { databaseOptions } from "../server/db/config.ts";
import {
  parseSearch,
  amountMinor,
  escapeLike,
} from "../server/catalog/input.ts";
import {
  buildSearchQuery,
  catalogRepository,
} from "../server/catalog/repository.ts";
import { normalizeAwinRow, normalizeAwinBatch } from "../server/feeds/awin.ts";
import {
  createRateLimiter,
  requestQuotaKey,
} from "../server/http/rate-limit.ts";
import { productSearchHandler, stagingCatalogDiagnosticReason } from "../server/http/product-search.ts";
import { handleImageSearch } from "../server/http/image-search.ts";
import {
  validateImageInput,
  UnavailableImageRecognizer,
} from "../server/images/recognition.ts";
const env = {
  DATABASE_ACCESS_ENABLED: "true",
  MYSQL_HOST: "127.0.0.1",
  MYSQL_DATABASE: "findmydup_test",
  MYSQL_USER: "test_reader",
  MYSQL_PASSWORD: "test-only-placeholder",
};
const policy = {
  retailerId: "00000000-0000-0000-0000-000000000001",
  merchantId: "123",
  imageHosts: ["cdn.example.test"],
  categoryBySource: { "Test category": "mode" },
};
const row = {
  merchant_id: "123",
  aw_product_id: "456",
  product_name: "Test fixture, not a real offer",
  description: "CI fixture only",
  search_price: "12.34",
  currency: "EUR",
  category_name: "Test category",
  aw_image_url: "https://cdn.example.test/fixture.png",
  aw_deep_link: "https://www.awin1.com/cread.php?awinmid=123",
  in_stock: "",
};
test("database access is opt-in, roles do not fall back to runtime credentials", () => {
  assert.throws(() => databaseOptions("read", {}));
  assert.throws(() =>
    databaseOptions("read", { ...env, DATABASE_ACCESS_ENABLED: "false" }),
  );
  assert.throws(() =>
    databaseOptions("import", { ...env, AWIN_IMPORT_ENABLED: "true" }),
  );
  assert.throws(() =>
    databaseOptions("migration", { ...env, DB_MIGRATIONS_ENABLED: "true" }),
  );
  const options = databaseOptions("read", env);
  assert.equal(options.multipleStatements, false);
  assert.equal(options.connectionLimit, 2);
});
test("remote MySQL refuses unencrypted connections and invalid pool limits", () => {
  assert.throws(() =>
    databaseOptions("read", {
      ...env,
      MYSQL_HOST: "db.example.test",
      MYSQL_TLS_MODE: "disabled",
    }),
  );
  assert.throws(() =>
    databaseOptions("read", { ...env, MYSQL_CONNECTION_LIMIT: "500" }),
  );
  assert.equal(
    databaseOptions("read", { ...env, MYSQL_HOST: "db.example.test" }).ssl
      ?.rejectUnauthorized,
    true,
  );
});
test("prices are exact minor units, not floating point estimates", () => {
  assert.equal(amountMinor("19.99"), 1999);
  assert.equal(amountMinor("0.01"), 1);
  assert.equal(amountMinor("0"), 0);
  for (const value of ["-1", "1.234", "1e3", "NaN", "1,99", "10000001", 12])
    assert.throws(() => amountMinor(value));
});
test("search rejects unbounded pagination, arbitrary sorting and duplicate parameters", () => {
  for (const q of [
    "q=x",
    "q=bag&page=51",
    "q=bag&pageSize=25",
    "q=bag&sort=title;DROP",
    "q=bag&q=shoe",
    "q=bag&debug=true",
    "q=bag&category=../bad",
  ])
    assert.throws(() => parseSearch(new URLSearchParams(q)));
});
test("SQL injection and wildcard tokens remain escaped prepared parameter values", () => {
  const input = parseSearch(
    new URLSearchParams({ q: "x%' OR 1=1 --", sort: "price-desc" }),
  );
  const query = buildSearchQuery(input);
  assert.equal(query.sql.includes(input.q), false);
  assert.ok(query.sql.includes("pr.amount_minor DESC"));
  assert.ok(
    query.values.some((v) => typeof v === "string" && v.includes("OR")),
  );
  assert.equal(escapeLike("50%_!"), "50!%!_!!");
});
test("empty real catalog never falls back to demo products", async () => {
  const result = await catalogRepository(async () => []).search(
    parseSearch(new URLSearchParams("q=tasche")),
  );
  assert.deepEqual(result.offers, []);
  assert.equal(result.source, "catalog");
  assert.equal(result.hasMore, false);
});
test("feed normalization requires identity, real amount and approved source hosts", () => {
  const normalized = normalizeAwinRow(row, policy);
  assert.equal(normalized.amountMinor, 1234);
  assert.equal(normalized.availability, "unknown");
  for (const bad of [
    { merchant_id: "999" },
    { search_price: "" },
    { currency: "USD" },
    { aw_image_url: "http://localhost/test" },
    { aw_deep_link: "javascript:alert(1)" },
    { category_name: "Unmapped" },
  ])
    assert.throws(() => normalizeAwinRow({ ...row, ...bad }, policy));
  assert.throws(() => normalizeAwinBatch([row, row], policy));
  assert.throws(() => normalizeAwinBatch([], policy));
});
test("rate limits cannot be reset by spoofed forwarded IPs or bucket eviction", () => {
  const allow = createRateLimiter(2, 1000, 1);
  assert.equal(allow("same", 0), true);
  assert.equal(allow("same", 0), true);
  assert.equal(allow("same", 0), false);
  assert.equal(allow("other", 0), false);
  assert.equal(allow("same", 1001), true);
  const request = new Request("https://example.test", {
    headers: { "x-real-ip": "203.0.113.5" },
  });
  assert.equal(requestQuotaKey(request), "shared");
  assert.equal(requestQuotaKey(request, true), "203.0.113.5");
});
test("disabled API never calls the database; bad inputs and faults have safe responses", async () => {
  let calls = 0;
  const search = async () => {
    calls++;
    throw new Error("password=private-value SQL=secret");
  };
  const disabled = productSearchHandler({
    enabled: () => false,
    search,
    allow: () => true,
  });
  assert.equal(
    (
      await disabled(
        new Request("https://example.test/api/products/search?q=bag"),
      )
    ).status,
    503,
  );
  assert.equal(calls, 0);
  const enabled = productSearchHandler({
    enabled: () => true,
    search,
    allow: () => true,
  });
  assert.equal(
    (await enabled(new Request("https://example.test/?q=x"))).status,
    400,
  );
  const response = await enabled(new Request("https://example.test/?q=bag"));
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes("private-value"), false);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const limited = productSearchHandler({
    enabled: () => true,
    search,
    allow: () => false,
  });
  assert.equal(
    (await limited(new Request("https://example.test/?q=bag"))).status,
    429,
  );
});
test("staging diagnostic uses fixed labels and never prints arbitrary error content", () => {
  assert.equal(stagingCatalogDiagnosticReason(new Error("password=private SQL=secret")), "unclassified");
  assert.equal(stagingCatalogDiagnosticReason(new Error("Staging compatibility identity or grants rejected")),
    "Staging compatibility identity or grants rejected");
  assert.equal(stagingCatalogDiagnosticReason(Object.assign(new Error("secret"), { code: "ER_ACCESS_DENIED_ERROR" })),
    "ER_ACCESS_DENIED_ERROR");
  assert.equal(stagingCatalogDiagnosticReason(Object.assign(new Error("secret"), { code: "PRIVATE_SERVER_MESSAGE" })),
    "unclassified");
});

test("image endpoint remains disabled and does not consume uploaded bodies", async () => {
  const request = new Request("https://example.test/api/image-search", {
    method: "POST",
    body: "private image data",
  });
  const response = await handleImageSearch(request);
  assert.equal(response.status, 503);
  assert.equal(request.bodyUsed, false);
  assert.equal(
    (
      await handleImageSearch(
        new Request("https://example.test/api/image-search", {
          method: "POST",
          headers: { "content-length": "99999999" },
        }),
      )
    ).status,
    413,
  );
  assert.throws(() =>
    validateImageInput(new Uint8Array([1, 2, 3]), "image/png"),
  );
  assert.throws(() => validateImageInput(new Uint8Array(), "image/jpeg"));
  await assert.rejects(
    () => new UnavailableImageRecognizer().recognize(),
    /not implemented/,
  );
});

test("one explicitly configured staging user can serve maintenance roles without credential fallback", () => {
  const shared = { ...env, MYSQL_USER: "u874339379_findmyduptest", MYSQL_DATABASE: "u874339379_findmyduptest" };
  assert.throws(() => databaseOptions("migration", { ...shared, DB_MIGRATIONS_ENABLED: "true" }));
  assert.throws(() => databaseOptions("import", { ...shared, AWIN_IMPORT_ENABLED: "true" }));
  assert.equal(databaseOptions("migration", { ...shared, DB_MIGRATIONS_ENABLED: "true", MYSQL_MIGRATION_USER: shared.MYSQL_USER, MYSQL_MIGRATION_PASSWORD: shared.MYSQL_PASSWORD }).user, shared.MYSQL_USER);
  assert.equal(databaseOptions("import", { ...shared, AWIN_IMPORT_ENABLED: "true", MYSQL_IMPORT_USER: shared.MYSQL_USER, MYSQL_IMPORT_PASSWORD: shared.MYSQL_PASSWORD }).user, shared.MYSQL_USER);
});

test("staging database roles reject the production target before connecting", () => {
  const production = { ...env, DEPLOYMENT_ENV: "staging", MYSQL_DATABASE: "u874339379_findmydupde", DB_MIGRATIONS_ENABLED: "true", AWIN_IMPORT_ENABLED: "true", MYSQL_MIGRATION_USER: "test", MYSQL_MIGRATION_PASSWORD: "dummy-test-only", MYSQL_IMPORT_USER: "test", MYSQL_IMPORT_PASSWORD: "dummy-test-only" };
  for (const role of ["read", "migration", "import"] as const)
    assert.throws(() => databaseOptions(role, production));
});
