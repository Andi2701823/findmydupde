import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { importAwinBatch } from "../server/feeds/importer.ts";
import { closeDatabases } from "../server/db/connection.ts";
import type { AwinPolicy } from "../server/feeds/awin.ts";
// Staged NDJSON only. A future authorized CSV downloader must be implemented separately.
async function main() {
  if (
    !process.argv.includes("--confirm") ||
    process.env.AWIN_IMPORT_ENABLED !== "true" ||
    process.env.DATABASE_ACCESS_ENABLED !== "true"
  )
    throw new Error("Import disabled");
  const file = process.argv[2];
  if (!file || file.startsWith("--"))
    throw new Error("Missing staged NDJSON file");
  const info = await stat(file);
  if (!info.isFile() || info.size > 2 * 1024 * 1024)
    throw new Error("Invalid staged file");
  const policyValue: unknown = JSON.parse(
    process.env.AWIN_CATEGORY_MAPPING_JSON || "{}",
  );
  if (
    !policyValue ||
    typeof policyValue !== "object" ||
    Array.isArray(policyValue) ||
    Object.values(policyValue).some((v) => typeof v !== "string")
  )
    throw new Error("Invalid category mapping");
  const policy: AwinPolicy = {
    retailerId: process.env.AWIN_RETAILER_ID || "",
    merchantId: process.env.AWIN_MERCHANT_ID || "",
    imageHosts: (process.env.AWIN_ALLOWED_IMAGE_HOSTS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    categoryBySource: policyValue as Record<string, string>,
  };
  const rows: Record<string, unknown>[] = [];
  for await (const line of createInterface({
    input: createReadStream(file),
    crlfDelay: Infinity,
  })) {
    if (!line.trim()) continue;
    if (line.length > 20000 || rows.length >= 250)
      throw new Error("Import exceeds bounded batch limits");
    const row: unknown = JSON.parse(line);
    if (!row || typeof row !== "object" || Array.isArray(row))
      throw new Error("Invalid feed row");
    rows.push(row as Record<string, unknown>);
  }
  const result = await importAwinBatch(rows, policy);
  console.log("Approved staged feed batch imported:", result.records);
}
try {
  await main();
} catch {
  console.error(
    "Import failed or is disabled. No feed URLs, source records or credentials are logged.",
  );
  process.exitCode = 1;
} finally {
  await closeDatabases();
}
