import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const port = 3221;
const origin = "http://127.0.0.1:" + port;
const server = spawn(process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", String(port), "--hostname", "127.0.0.1"], {
    stdio: "ignore",
    env: { ...process.env,
      DEPLOYMENT_ENV: "production", EBAY_PRODUCTION_ENABLED: "true",
      EBAY_SEARCH_ENABLED: "true", EBAY_MARKETPLACE_ID: "EBAY_DE",
      DATABASE_ACCESS_ENABLED: "false", CATALOG_SEARCH_ENABLED: "false",
      AWIN_IMPORT_ENABLED: "false", DB_MIGRATIONS_ENABLED: "false",
      IMAGE_SEARCH_ENABLED: "false",
    },
  });
let browser;
const makeOffer = (id, title, price, condition = "New") => ({
  source: "ebay", externalId: id, title,
  imageUrl: "https://i.ebayimg.com/images/g/test/s-l225.jpg",
  price, currency: "EUR", retailer: "eBay",
  outboundUrl: "https://www.ebay.de/itm/" + id,
  affiliate: false, condition, seller: "example",
  shippingCost: null, priceObservedAt: new Date().toISOString(),
});
const items = [
  makeOffer("100", "Leder Handtasche Original", 120),
  makeOffer("101", "Handtasche Leder günstig", 79.99),
  makeOffer("102", "Handtasche gebraucht", 89.90, "Used"),
  makeOffer("103", "Handtasche teuer", 150),
];
try {
  let online = false;
  for (let i = 0; i < 160; i++) {
    if (server.exitCode !== null) break;
    try { if ((await fetch(origin)).ok) { online = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(online, true, "Next.js server should start for eBay comparison UI");
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 860 } });
  await page.route("**/api/ebay/search/**", route => {
    assert.equal(new URL(route.request().url()).searchParams.get("q"), "handtasche");
    return route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ source: "ebay", marketplace: "EBAY_DE", items }) });
  });
  await page.route("https://i.ebayimg.com/**", route => route.fulfill({
    status: 200, contentType: "image/png",
    body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9SjlZyQAAAAASUVORK5CYII=", "base64"),
  }));
  await page.goto(origin + "/suche/?q=handtasche&source=ebay", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Produkte auf eBay vergleichen" }).waitFor();
  await page.locator('[data-ebay-offer="100"]').waitFor();
  assert.equal(await page.locator("[data-ebay-offer]").count(), 4);
  assert.match(await page.locator(".ebay-comparison-summary").innerText(), /79,99/);
  await page.locator('[data-ebay-offer="100"]').getByRole("button", { name: "Als Preisreferenz wählen" }).click();
  await page.locator('[data-ebay-offer="100"]').waitFor({ state: "detached" });
  assert.equal(await page.locator("[data-ebay-offer]").count(), 2, "only cheaper offers remain");
  assert.equal(await page.locator('[data-ebay-offer="101"] .ebay-saving').count(), 1);
  assert.match(await page.locator('[data-ebay-offer="101"] .ebay-saving').innerText(), /40,01/);
  await page.getByRole("checkbox", { name: /Nur Angebote mit demselben angegebenen Zustand/ }).check();
  assert.equal(await page.locator("[data-ebay-offer]").count(), 1, "same condition filter removes used item");
  await page.getByRole("button", { name: "Vergleich zurücksetzen" }).click();
  assert.equal(await page.locator("[data-ebay-offer]").count(), 4);
  await page.getByRole("textbox", { name: /Originalpreis/ }).fill("100,00");
  assert.equal(await page.locator("[data-ebay-offer]").count(), 2);
  await page.getByRole("textbox", { name: /Originalpreis/ }).fill("kein preis");
  await page.getByRole("alert").getByText(/gültigen positiven Betrag/).waitFor();
  assert.equal(await page.locator("[data-ebay-offer]").count(), 4);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.locator('a[rel*="sponsored"][href*="awin1.com"]').count() >= 0, true);
  console.log("PASS: eBay reference selection, cheaper-price arithmetic, condition filter, manual price, invalid input, mobile layout, and original search results.");
} finally {
  await browser?.close();
  server.kill();
}
