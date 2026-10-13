import test from "node:test";
import assert from "node:assert/strict";
import { products } from "../lib/catalog.ts";
import { demoCatalog, filterProducts, searchDemo } from "../lib/search.ts";
import { MAX_IMAGE_SIZE, validateImage } from "../lib/upload.ts";
import type { SearchFilters } from "../lib/types.ts";
const filters: SearchFilters = {
  category: "Alle",
  maxPrice: 200,
  color: "Alle",
  sort: "relevance",
};
test("search finds a product through its everyday German name", () => {
  assert.deepEqual(
    searchDemo({ mode: "text", query: "  HANDTASCHE  " }).map((p) => p.id),
    ["bag-sage"],
  );
});
test("accents and case do not prevent a search", () => {
  assert.deepEqual(
    searchDemo({ mode: "text", query: "KOPFHORER" }).map((p) => p.id),
    ["headphones"],
  );
});
test("multiple search words must match the same product", () => {
  assert.equal(searchDemo({ mode: "text", query: "Tasche Grün" }).length, 1);
  assert.equal(searchDemo({ mode: "text", query: "Tasche Rosa" }).length, 0);
});
test("unknown products yield no invented search results", () => {
  assert.equal(
    searchDemo({ mode: "text", query: "NichtVorhandeneMarke" }).length,
    0,
  );
});
test("the photo demo uses the chosen category and does not claim image matches", async () => {
  const result = await demoCatalog.search({
    mode: "image-demo",
    query: "",
    category: "Beauty",
  });
  assert.equal(result.source, "demo");
  assert.equal(result.products.length, 2);
  assert.ok(result.products.every((p) => p.category === "Beauty"));
  assert.match(result.notice, /Keine Live-Suche/);
});
test("category, color and price filters work together and preserve input order", () => {
  const original = products.map((p) => p.id);
  const found = filterProducts(products, {
    ...filters,
    category: "Wohnen",
    color: "Braun",
    maxPrice: 25,
  });
  assert.deepEqual(
    found.map((p) => p.id),
    ["vase-terracotta"],
  );
  assert.deepEqual(
    products.map((p) => p.id),
    original,
  );
});
test("price sorting is numeric and the zero budget gives an empty result", () => {
  const sorted = filterProducts(products, { ...filters, sort: "price-asc" });
  assert.equal(sorted[0].id, "lipstick");
  assert.equal(sorted.at(-1)?.id, "chair-olive");
  assert.equal(filterProducts(products, { ...filters, maxPrice: 0 }).length, 0);
});
test("every fixture is explicitly a demo with a local illustration and no retailer URL", () => {
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  for (const p of products) {
    assert.equal(p.source, "demo");
    assert.ok(p.image.startsWith("/products/"));
    assert.equal("outboundUrl" in p, false);
  }
});
test("image limits accept boundary values and reject oversized, empty and unsupported files", () => {
  assert.equal(
    validateImage({ type: "image/png", size: MAX_IMAGE_SIZE }),
    null,
  );
  assert.match(
    validateImage({ type: "image/png", size: MAX_IMAGE_SIZE + 1 }) || "",
    /5 MB/,
  );
  assert.match(validateImage({ type: "image/png", size: 0 }) || "", /leer/);
  assert.match(validateImage({ type: "image/svg+xml", size: 10 }) || "", /JPG/);
  assert.match(validateImage({ type: "text/plain", size: 10 }) || "", /JPG/);
});
