import "server-only";
import { amountMinor } from "../catalog/input.ts";
import { httpsUrl } from "../catalog/urls.ts";
export interface AwinPolicy {
  retailerId: string;
  merchantId: string;
  imageHosts: readonly string[];
  categoryBySource: Readonly<Record<string, string>>;
}
export interface AwinProduct {
  merchantId: string;
  externalId: string;
  sourceKey: string;
  title: string;
  description: string;
  categorySlug: string;
  amountMinor: number;
  currency: "EUR";
  imageUrl: string | null;
  affiliateUrl: string;
  availability: "unknown" | "in_stock" | "out_of_stock";
}
export function normalizeAwinRow(
  row: Readonly<Record<string, unknown>>,
  policy: AwinPolicy,
): AwinProduct {
  function text(field: string, max: number, optional = false) {
    const raw = row[field];
    if (optional && (raw === undefined || raw === null || raw === ""))
      return "";
    if (
      typeof raw !== "string" ||
      !raw.trim() ||
      raw.length > max ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw)
    )
      throw new Error("Invalid feed field: " + field);
    return raw.trim();
  }
  const merchantId = text("merchant_id", 30),
    externalId = text("aw_product_id", 30);
  if (
    !/^\d{1,30}$/.test(merchantId) ||
    merchantId !== policy.merchantId ||
    !/^\d{1,30}$/.test(externalId)
  )
    throw new Error("Unapproved feed identity");
  if (text("currency", 3) !== "EUR")
    throw new Error("Unsupported feed currency");
  const categorySource = text("category_name", 120);
  const categorySlug = Object.hasOwn(policy.categoryBySource, categorySource)
    ? policy.categoryBySource[categorySource]
    : undefined;
  if (!categorySlug || !/^[a-z0-9-]{1,64}$/.test(categorySlug))
    throw new Error("Unmapped feed category");
  const image = text("aw_image_url", 2048, true);
  if (image && !policy.imageHosts.length)
    throw new Error("No approved image hosts");
  const stock = text("in_stock", 10, true);
  if (stock && !["0", "1"].includes(stock))
    throw new Error("Unsupported stock value");
  const affiliateUrl = httpsUrl(text("aw_deep_link", 2048), [
    "www.awin1.com",
    "awin1.com",
  ]);
  const tracker = new URL(affiliateUrl);
  const linkedMerchant =
    tracker.searchParams.get("awinmid") || tracker.searchParams.get("mid");
  if (linkedMerchant && linkedMerchant !== merchantId)
    throw new Error("Affiliate merchant mismatch");
  return {
    merchantId,
    externalId,
    sourceKey: merchantId + ":" + externalId,
    title: text("product_name", 300),
    description: text("description", 10000, true),
    categorySlug,
    amountMinor: amountMinor(text("search_price", 30)),
    currency: "EUR",
    imageUrl: image ? httpsUrl(image, policy.imageHosts) : null,
    affiliateUrl,
    availability:
      stock === "1" ? "in_stock" : stock === "0" ? "out_of_stock" : "unknown",
  };
}
export function normalizeAwinBatch(
  rows: readonly Readonly<Record<string, unknown>>[],
  policy: AwinPolicy,
) {
  if (!rows.length || rows.length > 250)
    throw new Error("Import batch must contain 1 to 250 rows");
  const products = rows.map((row) => normalizeAwinRow(row, policy));
  const keys = new Set(products.map((p) => p.sourceKey));
  if (keys.size !== products.length)
    throw new Error("Duplicate feed identity within batch");
  return products;
}
// CSV/download adapters must supply explicit source fields. No scraper, URL fetch or scheduler is enabled.
export interface AuthorizedFeedSource {
  readRows(): AsyncIterable<Readonly<Record<string, unknown>>>;
}
