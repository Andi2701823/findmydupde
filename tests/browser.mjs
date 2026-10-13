import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright-core";
const port = 3217;
const origin = `http://127.0.0.1:${port}`;
const staticMode = process.argv.includes("--static");
const server = staticMode
  ? spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1", "--directory", "static-app/out"], { stdio: "ignore" })
  : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"], {
      stdio: "ignore",
      env: { ...process.env, PORT: String(port), DATABASE_ACCESS_ENABLED: "false", CATALOG_SEARCH_ENABLED: "false", DB_MIGRATIONS_ENABLED: "false", AWIN_IMPORT_ENABLED: "false", IMAGE_SEARCH_ENABLED: "false" },
    });
let browser;
let page;
try {
  let ready = false;
  for (let n = 0; n < 100; n++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Browser test server could not start.");
  const macChrome =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : existsSync(macChrome)
        ? { executablePath: macChrome }
        : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  page = await context.newPage();
  const errors = [];
  const remoteRequests = [];
  const uploads = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (req) => {
    if (/^https?:/.test(req.url()) && !req.url().startsWith(origin))
      remoteRequests.push(req.url());
    if (!["GET", "HEAD"].includes(req.method())) uploads.push(req.url());
  });
  await page.goto(origin);
  await page
    .getByRole("heading", { name: "Dein Stil. Für weniger." })
    .waitFor();
  await page
    .getByRole("textbox", { name: "Produktname", exact: true })
    .fill("Tasche");
  await page.getByRole("button", { name: "Entdecken", exact: true }).click();
  await page.getByRole("heading", { name: "Funde für „Tasche“" }).waitFor();
  await page.waitForFunction(
    () => document.querySelectorAll(".results-grid .product-card").length === 1,
  );
  await page
    .getByRole("button", {
      name: "Die kleine Everyday Bag merken",
      exact: true,
    })
    .click();
  await page.getByRole("link", { name: "Merkliste", exact: true }).click();
  await page.getByRole("heading", { name: "Deine Lieblingsfunde." }).waitFor();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 1,
  );
  await page.reload();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 1,
  );
  await page
    .getByRole("button", { name: "Details zu Die kleine Everyday Bag" })
    .click();
  assert.equal(await page.locator("dialog[open]").count(), 1);
  assert.match(
    await page.locator("dialog[open]").innerText(),
    /keinen Kauf-Link/,
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  await page
    .getByRole("button", {
      name: "Die kleine Everyday Bag aus Merkliste entfernen",
      exact: true,
    })
    .click();
  await page
    .getByRole("heading", { name: "Platz für deine Favoriten." })
    .waitFor();
  await page.goto(`${origin}/suche/`);
  await page.waitForFunction(
    () => document.querySelectorAll(".results-grid .product-card").length === 8,
  );
  await page.getByLabel("Sortieren").selectOption("price-asc");
  assert.match(
    await page.locator(".results-grid .product-card h3").first().innerText(),
    /Lippenstift/,
  );
  await page.getByRole("radio", { name: "Wohnen", exact: true }).check();
  await page.getByLabel("Farbe", { exact: true }).selectOption("Braun");
  await page.getByLabel("Max. Beispielpreis").press("Home");
  for (let n = 0; n < 25; n++)
    await page.getByLabel("Max. Beispielpreis").press("ArrowRight");
  assert.equal(await page.locator(".results-grid .product-card").count(), 1);
  assert.match(await page.locator(".results-grid").innerText(), /Keramikvase/);
  await page.getByLabel("Max. Beispielpreis").press("Home");
  await page
    .getByRole("heading", { name: "Hier ist noch kein passender Fund." })
    .waitFor();
  await page
    .getByRole("button", { name: "Filter zurücksetzen", exact: true })
    .click();
  assert.equal(await page.locator(".results-grid .product-card").count(), 8);
  await page.goto(`${origin}/suche/?q=UnbekannterArtikel`);
  await page
    .getByRole("heading", { name: "Hier ist noch kein passender Fund." })
    .waitFor();
  await page.goto(origin);
  await page.getByRole("tab", { name: "Foto hochladen" }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Demo-Ergebnisse ansehen" })
      .isDisabled(),
    true,
  );
  await page.locator("#product-image").setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("test"),
  });
  await page.getByRole("alert").filter({ hasText: "JPG" }).waitFor();
  await page.locator("#product-image").setInputFiles({
    name: "huge.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await page.getByRole("alert").filter({ hasText: "zu groß" }).waitFor();
  await page.locator("#product-image").setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("not a valid image"),
  });
  await page.getByRole("alert").filter({ hasText: "nicht öffnen" }).waitFor();
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGOomFz9HwAFkwKGwufLZgAAAABJRU5ErkJggg==",
    "base64",
  );
  await page
    .locator("#product-image")
    .setInputFiles({ name: "product.png", mimeType: "image/png", buffer: png });
  await page
    .getByAltText("Vorschau deines ausgewählten Produktbildes")
    .waitFor();
  await page
    .getByAltText("Vorschau deines ausgewählten Produktbildes")
    .evaluate((image) => image.decode());
  await page.getByLabel("Beispielbereich").selectOption("Beauty");
  await page.getByRole("button", { name: "Demo-Ergebnisse ansehen" }).click();
  await page
    .getByRole("heading", { name: "Deine Bildsuche, als Demo." })
    .waitFor();
  await page.waitForFunction(
    () => document.querySelectorAll(".results-grid .product-card").length === 2,
  );
  assert.match(
    await page.locator(".results-heading").innerText(),
    /nicht analysiert oder hochgeladen/,
  );
  mkdirSync("test-artifacts", { recursive: true });
  await page.goto(origin);
  await page.screenshot({
    path: "test-artifacts/home-desktop.png",
    fullPage: true,
  });
  for (const width of [375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/suche/",
      "/merkliste/",
      "/datenschutz/",
      "/impressum/",
    ]) {
      await page.goto(origin + route);
      await page.locator("main").waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${route} overflows at ${width}px`,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Entdecken", exact: true })
    .click();
  await page.getByRole("heading", { name: "Lass dich inspirieren." }).waitFor();
  await page.getByRole("button", { name: /^Filter/ }).click();
  await page.getByRole("radio", { name: "Technik", exact: true }).check();
  assert.equal(await page.locator(".results-grid .product-card").count(), 1);
  await page.screenshot({
    path: "test-artifacts/results-mobile.png",
    fullPage: true,
  });
  await page.goto(origin);
  await page.screenshot({
    path: "test-artifacts/home-mobile.png",
    fullPage: true,
  });
  await page.evaluate(() =>
    localStorage.setItem("findmydup:favorites", "{broken"),
  );
  await page.goto(`${origin}/merkliste/`);
  await page
    .getByRole("heading", { name: "Platz für deine Favoriten." })
    .waitFor();
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(`${origin}/suche/?q=Tasche`);
  await blockedPage
    .getByRole("button", {
      name: "Die kleine Everyday Bag merken",
      exact: true,
    })
    .click();
  await blockedPage
    .getByRole("link", { name: "Merkliste", exact: true })
    .click();
  await blockedPage.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 1,
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(remoteRequests, []);
  assert.deepEqual(uploads, []);
  console.log(
    "PASS: production UI routes, text search, empty results, photo validation and preview, category demo, filters, sorting, details, favorites, corrupt/blocked storage, mobile navigation, responsive layouts, no remote requests or image uploads.",
  );
} catch (error) {
  mkdirSync("test-artifacts", { recursive: true });
  if (page && !page.isClosed())
    await page
      .screenshot({ path: "test-artifacts/failure.png", fullPage: true })
      .catch(() => {});
  throw error;
} finally {
  await browser?.close();
  server.kill();
}
