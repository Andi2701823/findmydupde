import "server-only";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "../db/connection.ts";
import { normalizeAwinBatch, type AwinPolicy } from "./awin.ts";
export async function importAwinBatch(
  rows: readonly Readonly<Record<string, unknown>>[],
  policy: AwinPolicy,
) {
  // Validate a complete bounded batch before acquiring a connection. Both access gates are required.
  const records = normalizeAwinBatch(rows, policy);
  if (!/^[a-f0-9-]{36}$/.test(policy.retailerId))
    throw new Error("Invalid approved retailer ID");
  const connection = await getDatabase("import").getConnection();
  const runId = randomUUID();
  const observedAt = new Date();
  let runStarted = false;
  try {
    const [retailers] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM retailers WHERE id=? AND awin_merchant_id=? AND enabled=1",
      [policy.retailerId, policy.merchantId],
    );
    if (!retailers.length)
      throw new Error("Retailer is not approved for this feed");
    await connection.execute(
      "INSERT INTO feed_runs (id,retailer_id,source,status,observed_at) VALUES (?,?,'awin','running',?)",
      [runId, policy.retailerId, observedAt],
    );
    runStarted = true;
    await connection.beginTransaction();
    for (const record of records) {
      const [categories] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM categories WHERE slug=?",
        [record.categorySlug],
      );
      if (!categories.length)
        throw new Error("Approved catalog category is missing");
      await connection.execute(
        `INSERT INTO products (id,source,source_key,title,description,category_id,active)
        VALUES (?,'awin',?,?,?,?,1) ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),category_id=VALUES(category_id),active=1`,
        [
          randomUUID(),
          record.sourceKey,
          record.title,
          record.description,
          categories[0].id,
        ],
      );
      const [products] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM products WHERE source='awin' AND source_key=?",
        [record.sourceKey],
      );
      const productId = String(products[0].id);
      await connection.execute(
        `INSERT INTO offers (id,product_id,retailer_id,external_product_id,availability,active,last_seen_at)
        VALUES (?,?,?,?,?,1,?) ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),availability=VALUES(availability),active=1,last_seen_at=VALUES(last_seen_at)`,
        [
          randomUUID(),
          productId,
          policy.retailerId,
          record.externalId,
          record.availability,
          observedAt,
        ],
      );
      const [offers] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM offers WHERE retailer_id=? AND external_product_id=?",
        [policy.retailerId, record.externalId],
      );
      const offerId = String(offers[0].id);
      await connection.execute(
        "INSERT INTO prices (id,offer_id,amount_minor,currency,observed_at) VALUES (?,?,?,'EUR',?)",
        [randomUUID(), offerId, record.amountMinor, observedAt],
      );
      await connection.execute(
        "DELETE FROM product_images WHERE product_id=?",
        [productId],
      );
      if (record.imageUrl)
        await connection.execute(
          "INSERT INTO product_images (id,product_id,url,position,approved) VALUES (?,?,?,0,1)",
          [randomUUID(), productId, record.imageUrl],
        );
      await connection.execute(
        `INSERT INTO affiliate_links (id,offer_id,network,url,enabled,observed_at) VALUES (?,?,'awin',?,1,?)
        ON DUPLICATE KEY UPDATE url=VALUES(url),enabled=1,observed_at=VALUES(observed_at)`,
        [randomUUID(), offerId, record.affiliateUrl, observedAt],
      );
    }
    await connection.execute(
      "UPDATE feed_runs SET status='completed',record_count=?,completed_at=UTC_TIMESTAMP(3) WHERE id=?",
      [records.length, runId],
    );
    await connection.commit();
    return { runId, records: records.length };
  } catch (error) {
    await connection.rollback();
    if (runStarted)
      await connection.execute(
        "UPDATE feed_runs SET status='failed',completed_at=UTC_TIMESTAMP(3) WHERE id=?",
        [runId],
      );
    throw error;
  } finally {
    connection.release();
  }
}
