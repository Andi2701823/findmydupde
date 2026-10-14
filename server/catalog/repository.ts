import "server-only";
import { safePublicUrl } from "./urls.ts";
import type { CatalogSearch } from "./input.ts";
import { escapeLike, MAX_AMOUNT_MINOR } from "./input.ts";
export interface CatalogOffer {
  source: "awin";
  productId: string;
  offerId: string;
  title: string;
  description: string;
  category: string;
  color: string | null;
  material: string | null;
  retailer: { id: string; name: string };
  imageUrl: string | null;
  price: { amountMinor: number; currency: "EUR"; observedAt: string };
  availability: "unknown" | "in_stock";
  affiliateUrl: string | null;
}
export interface CatalogRow {
  product_id: string;
  offer_id: string;
  title: string;
  description: string;
  category: string;
  color: string | null;
  material: string | null;
  retailer_id: string;
  retailer_name: string;
  image_url: string | null;
  amount_minor: string;
  currency: string;
  observed_at: string;
  availability: string;
  affiliate_url: string | null;
}
export type SearchExecutor = (
  sql: string,
  values: (string | number)[],
) => Promise<CatalogRow[]>;
export function buildSearchQuery(input: CatalogSearch, maxAgeDays = 3) {
  if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 30)
    throw new Error("Invalid freshness limit");
  const conditions = [
    "p.active = 1",
    "p.source = 'awin'",
    "r.enabled = 1",
    "o.active = 1",
    "o.availability <> 'out_of_stock'",
    "pr.currency = 'EUR'",
    "o.last_seen_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)",
  ];
  const values: (string | number)[] = [maxAgeDays];
  for (const token of input.tokens) {
    conditions.push("p.title LIKE ? ESCAPE '!'");
    values.push("%" + escapeLike(token) + "%");
  }
  if (input.category) {
    conditions.push("c.slug = ?");
    values.push(input.category);
  }
  if (input.color) {
    conditions.push("p.color = ?");
    values.push(input.color);
  }
  if (input.maxPriceMinor !== undefined) {
    conditions.push("pr.amount_minor <= ?");
    values.push(input.maxPriceMinor);
  }
  const order = {
    "price-asc": "pr.amount_minor ASC",
    "price-desc": "pr.amount_minor DESC",
    recent: "pr.observed_at DESC",
  }[input.sort];
  values.push(input.pageSize + 1, (input.page - 1) * input.pageSize);
  return {
    sql: `SELECT /*+ MAX_EXECUTION_TIME(3000) */ p.id product_id, o.id offer_id, p.title, p.description, c.slug category,
    p.color, p.material, r.id retailer_id, r.name retailer_name, pr.amount_minor, pr.currency,
    pr.observed_at, o.availability,
    (SELECT i.url FROM product_images i WHERE i.product_id=p.id AND i.approved=1 ORDER BY i.position,i.id LIMIT 1) image_url,
    (SELECT a.url FROM affiliate_links a WHERE a.offer_id=o.id AND a.enabled=1 AND a.network='awin' LIMIT 1) affiliate_url
    FROM products p JOIN categories c ON c.id=p.category_id
    JOIN offers o ON o.product_id=p.id JOIN retailers r ON r.id=o.retailer_id
    JOIN prices pr ON pr.id=(SELECT px.id FROM prices px WHERE px.offer_id=o.id ORDER BY px.observed_at DESC,px.id DESC LIMIT 1)
    WHERE ${conditions.join(" AND ")} ORDER BY ${order},o.id ASC LIMIT ? OFFSET ?`,
    values,
  };
}
export function formatCatalogRows(rows: CatalogRow[], input: CatalogSearch) {
  const hasMore = rows.length > input.pageSize;
  const offers: CatalogOffer[] = rows
    .slice(0, input.pageSize)
    .map((row) => {
      const amount = Number(row.amount_minor);
      if (
        !Number.isSafeInteger(amount) ||
        amount < 0 ||
        amount > MAX_AMOUNT_MINOR ||
        row.currency !== "EUR"
      )
        throw new Error("Invalid catalog price");
      const timeValue = row.observed_at.replace(" ", "T");
      const timestamp = new Date(/(?:Z|[+-]\\d{2}:\\d{2})$/i.test(timeValue) ? timeValue : timeValue + "Z");
      if (!Number.isFinite(timestamp.getTime()))
        throw new Error("Invalid observation time");
      return {
        source: "awin",
        productId: row.product_id,
        offerId: row.offer_id,
        title: row.title,
        description: row.description,
        category: row.category,
        color: row.color,
        material: row.material,
        retailer: { id: row.retailer_id, name: row.retailer_name },
        imageUrl: safePublicUrl(row.image_url),
        price: {
          amountMinor: amount,
          currency: "EUR",
          observedAt: timestamp.toISOString(),
        },
        availability:
          row.availability === "in_stock" ? "in_stock" : "unknown",
        affiliateUrl: safePublicUrl(row.affiliate_url),
      };
    });
  return {
    source: "catalog" as const,
    offers,
    page: input.page,
    pageSize: input.pageSize,
    hasMore,
  };

}

export function catalogRepository(execute: SearchExecutor) {
  return {
    async search(input: CatalogSearch, maxAgeDays = 3) {
      const query = buildSearchQuery(input, maxAgeDays);
      const rows = await execute(query.sql, query.values);
      return formatCatalogRows(rows, input);
    },
  };
}
