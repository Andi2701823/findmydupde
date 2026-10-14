import test from "node:test";
import assert from "node:assert/strict";
import { compareCheaperOffers, cheapestOffer, parseReferencePrice } from "../lib/ebay-price-comparison.ts";

const data = [
  { externalId: "original", price: 120, currency: "EUR" as const, condition: "New" },
  { externalId: "a", price: 79.99, currency: "EUR" as const, condition: "new" },
  { externalId: "b", price: 89.90, currency: "EUR" as const, condition: "Used" },
  { externalId: "c", price: 150, currency: "EUR" as const, condition: "New" },
  { externalId: "d", price: 30, currency: "USD" as const, condition: "New" },
  { externalId: "bad", price: Number.NaN, currency: "EUR" as const, condition: null },
];
test("accepts sensible comma or decimal-point prices but not ambiguous input", () => {
  assert.equal(parseReferencePrice("89,99"), 89.99);
  assert.equal(parseReferencePrice(" 120.5 "), 120.5);
  for (const raw of ["", "0", "-2", "89,999", "1.000,00", "Infinity", "abc", "1000001"])
    assert.equal(parseReferencePrice(raw), null, raw);
});
test("compares only verified same-currency article prices in integer cents", () => {
  const found = compareCheaperOffers(data, { price: 120, currency: "EUR", externalId: "original" });
  assert.deepEqual(found.map(item => item.offer.externalId), ["a", "b"]);
  assert.deepEqual(found.map(item => item.difference), [40.01, 30.1]);
  assert.equal(found[0].differencePercent, 33);
  assert.equal(data[0].externalId, "original", "original array must not change");
});
test("condition filter excludes mismatches only when reference condition is known", () => {
  assert.deepEqual(compareCheaperOffers(data,
    { price: 120, currency: "EUR", condition: "NEW" }, true).map(x => x.offer.externalId), ["a"]);
  assert.equal(compareCheaperOffers(data, { price: 0, currency: "EUR" }).length, 0);
  assert.equal(compareCheaperOffers(data, { price: Infinity, currency: "EUR" }).length, 0);
  assert.equal(compareCheaperOffers(data, { price: 12, currency: "USD" }).length, 0);
});
test("finds cheapest valid offer without sorting or mutating marketplace relevance order", () => {
  assert.equal(cheapestOffer(data.filter(x => x.currency === "EUR"))?.externalId, "a");
  assert.equal(cheapestOffer([]), null);
  assert.deepEqual(data.map(x => x.externalId), ["original", "a", "b", "c", "d", "bad"]);
});
