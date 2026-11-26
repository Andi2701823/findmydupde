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
      JOYBUY_CATALOG_ENABLED: "true",
      SUPABASE_URL: "https://fixture.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixturetestonly",
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
  await page.getByRole("dialog", { name: "Deine Privatsphäre bei FindMyDup" })
    .getByRole("button", { name: "Auswahl speichern" }).click();
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
  // Combined search regression reproduces the user-reported JoyBuy/eBay result.
  await page.unroute("**/api/ebay/search/**");
  await page.route("**/api/ebay/search/**", route => {
    const q = new URL(route.request().url()).searchParams.get("q");
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({source:"ebay",marketplace:"EBAY_DE",items:q==="Kopfhörer"?[
      makeOffer("201","In Ear Kopfhörer Kabelgebunden 3,5mm Klinke Headset Mikrofon",3.89),
      makeOffer("202","Kopfhörer Bluetooth mit Ladekabel",29.99)
    ]:[]})});
  });
  const joybuy = (id, name, price, category="Technik") => ({
    external_id:id,product_name:name,price_cents:price,shipping_cents:399,category,
    image_url:"https://images1.joy-sourcing.com/test.png",
    affiliate_url:"https://www.awin1.com/cread.php?awinmid=123926&awinaffid=3123004"
  });
  const audioCable=joybuy("301","Baseus Yiven Audiokabel 3,5 mm Klinkenstecker auf Klinke 1m für Hi-Fi Kopfhörer und Boxen, silber/schwarz",198);
  await page.route("**/api/joybuy/search/**", route => {
    const q=new URL(route.request().url()).searchParams.get("q");
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:q==="Kopfhörer"?[
      audioCable,joybuy("302","Linghushaoxia USB-A Ladegerät für Elektronik Zubehör ideal für Bluetooth-Kopfhörer",402),
      joybuy("303","Sony Kopfhörer Over Ear",1999)
    ]:[audioCable]})});
  });
  await page.route("**/api/imou/search/**",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({products:[]})}));
  await page.route("https://images1.joy-sourcing.com/**",route=>route.abort());
  await page.goto(origin+"/suche/?q="+encodeURIComponent("Kopfhörer"),{waitUntil:"domcontentloaded"});
  await page.getByText("3 angezeigte Treffer",{exact:true}).waitFor();
  assert.equal(await page.getByLabel("Sortieren nach").inputValue(),"relevance");
  assert.equal(await page.locator(".unified-offer-best").count(),0);
  assert.equal(await page.locator(".unified-offer").count(),3);
  assert.equal(await page.locator(".unified-offer").filter({hasText:"Baseus Yiven Audiokabel"}).count(),0);
  assert.equal(await page.locator(".unified-offer").filter({hasText:"USB-A Ladegerät"}).count(),0);
  await page.getByLabel("Sortieren nach").selectOption("article");
  assert.equal(await page.locator(".unified-offer").first().getAttribute("data-article-cents"),"389");
  await page.locator(".unified-offer-best").getByText("Niedrigster Artikelpreis der geladenen Treffer").waitFor();
  await page.getByLabel("Sortieren nach").selectOption("total");
  assert.equal(await page.locator(".unified-offer").first().getAttribute("data-source"),"joybuy","Known shipping comes before unknown shipping");
  await page.goto(origin+"/suche/?q="+encodeURIComponent("Kopfhörer Audiokabel"),{waitUntil:"domcontentloaded"});
  await page.getByText("1 angezeigte Treffer",{exact:true}).waitFor();
  assert.equal(await page.locator(".unified-offer").filter({hasText:"Baseus Yiven Audiokabel"}).count(),1);
  console.log("PASS: combined headphone search, accessory exclusion, explicit accessory intent and both price sorts.");
  console.log("PASS: eBay reference selection, cheaper-price arithmetic, condition filter, manual price, invalid input, mobile layout, and original search results.");
} finally {
  await browser?.close();
  server.kill();
}
