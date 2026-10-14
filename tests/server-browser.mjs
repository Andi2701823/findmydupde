import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
const port = 3218,
  origin = `http://127.0.0.1:${port}`;
let child, browser;
async function stop() {
  if (!child) return;
  const current = child;
  child = undefined;
  if (current.exitCode !== null || current.signalCode !== null) return;
  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      current.kill("SIGKILL");
      resolve();
    }, 5000);
    current.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    current.kill("SIGTERM");
  });
}
async function start(enabled) {
  await stop();
  child = spawn(
    process.execPath,
    ["server-app/.next/standalone/server-app/server.js"],
    {
      stdio: ["ignore", "ignore", "pipe"],
      env: {
        ...process.env,
        PORT: String(port),
        HOSTNAME: "127.0.0.1",
        DATABASE_ACCESS_ENABLED: String(enabled),
        CATALOG_SEARCH_ENABLED: String(enabled),
        IMAGE_SEARCH_ENABLED: "false",
      },
    },
  );
  let startupError = "";
  child.stderr.on("data", (data) => {
    startupError = (startupError + data.toString()).slice(-4000);
  });
  let ready = false;
  for (let n = 0; n < 200; n++) {
    if (child.exitCode !== null || child.signalCode !== null) break;
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, "Server build did not start: " + startupError);
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
function cssHashes(dir) {
  return walk(dir)
    .filter((p) => p.endsWith(".css"))
    .map((p) => createHash("sha256").update(readFileSync(p)).digest("hex"))
    .sort();
}
try {
  await start(false);
  const disabled = await fetch(origin + "/api/products/search/?q=tasche");
  assert.equal(disabled.status, 503);
  assert.equal((await disabled.json()).error, "CATALOG_DISABLED");
  const image = await fetch(origin + "/api/image-search/", {
    method: "POST",
    body: "private bytes",
  });
  assert.equal(image.status, 503);
  assert.equal((await image.json()).error, "IMAGE_SEARCH_DISABLED");
  assert.deepEqual(
    cssHashes("server-app/.next/static"),
    cssHashes("out/_next/static"),
    "Static and server builds must use identical design CSS",
  );
  const secrets = [
    process.env.MYSQL_PASSWORD,
    process.env.MYSQL_MIGRATION_PASSWORD,
    process.env.MYSQL_IMPORT_PASSWORD,
  ].filter(Boolean);
  for (const file of walk("server-app/.next/static").filter((p) =>
    /\.(js|css|html)$/.test(p),
  )) {
    const content = readFileSync(file, "utf8");
    for (const secret of secrets)
      assert.equal(
        content.includes(secret),
        false,
        "Credential leaked into client bundle",
      );
  }
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page
      .getByRole("heading", { name: "Dein Stil. Deine Wahl." })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
  }
  await page.getByRole("searchbox", { name: "Thema oder Produkt suchen" }).fill("Serum");
  await page.getByRole("button", { name: "Entdecken", exact: true }).click();
  await page.getByRole("heading", { name: "Funde zu „Serum“" }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll(".affiliate-card").length > 0);
  assert.equal(await page.locator(".guide-card").count(), 1);
  await page.getByRole("button", { name: /Gesichtsserum vergleichen.*merken/ }).click();
  await page.getByRole("link", { name: "Merkliste", exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll(".guide-card").length === 1);
  await page.goto(origin + "/produkte/", { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Echte Beauty-Produkte. Direkt vom Händler." }).waitFor();
  await page.waitForFunction(() => document.querySelectorAll(".affiliate-card").length === 63);
  assert.equal(await page.locator('a[rel*="sponsored"]').count(), 63);
  assert.deepEqual(errors, []);
  mkdirSync("test-artifacts", { recursive: true });
  await page.screenshot({
    path: "test-artifacts/server-home.png",
    fullPage: true,
  });
  if (process.env.TEST_MYSQL_INTEGRATION_ENABLED === "true") {
    assert.equal(process.env.MYSQL_DATABASE, "findmydup_test");
    assert.equal(process.env.MYSQL_HOST, "127.0.0.1");
    await start(true);
    const result = await fetch(
      origin + "/api/products/search/?q=tasche&category=mode&maxPrice=11",
    );
    assert.equal(result.status, 200);
    const payload = await result.json();
    assert.equal(payload.source, "catalog");
    assert.equal(payload.offers.length, 1);
    assert.match(payload.offers[0].title, /Test fixture/);
    assert.equal(payload.offers[0].price.amountMinor, 1099);
    const empty = await fetch(
      origin + "/api/products/search/?q=definitelymissing",
    );
    assert.deepEqual((await empty.json()).offers, []);
    assert.equal(
      (await fetch(origin + "/api/products/search/?q=bag&sort=DROP")).status,
      400,
    );
    assert.equal(
      (await fetch(origin + "/api/products/search/?q=bag", { method: "POST" }))
        .status,
      405,
    );
    assert.equal(result.headers.get("cache-control"), "no-store");
    console.log(
      "PASS: live isolated MySQL search API, input rejection, safe empty results, method restrictions and disabled image analysis.",
    );
  }
  console.log(
    "PASS: separate server build, no database required by default, shared responsive editorial site, authentic affiliate links, saved guides, identical static/server CSS and no client credential leakage.",
  );
} finally {
  await browser?.close();
  await stop();
}
