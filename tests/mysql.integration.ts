import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase, closeDatabases } from "../server/db/connection.ts";
import { migrate } from "../server/db/migrations.ts";
import { importAwinBatch } from "../server/feeds/importer.ts";
import {
  catalogRepository,
  type CatalogRow,
} from "../server/catalog/repository.ts";
import { parseSearch } from "../server/catalog/input.ts";
const enabled = process.env.TEST_MYSQL_INTEGRATION_ENABLED === "true";
test(
  "isolated MySQL schema, approved imports, history, rollback and read-only search",
  { skip: !enabled },
  async () => {
    // This test must never connect to a production database, even with accidental environment values.
    assert.equal(process.env.MYSQL_DATABASE, "findmydup_test");
    assert.equal(process.env.MYSQL_HOST, "127.0.0.1");
    const connection = await getDatabase("migration").getConnection();
    try {
      await migrate(connection);
      await migrate(connection);
      const [tables] = await connection.query<RowDataPacket[]>("SHOW TABLES");
      assert.equal(tables.length, 9);
      const [empty] = await connection.execute<RowDataPacket[]>(
        "SELECT COUNT(*) n FROM products",
      );
      assert.equal(Number(empty[0].n), 0);
      // Test-only accounts receive explicit privileges. The application user cannot write.
      for (const [role, user, password] of [
        ["read", process.env.MYSQL_USER, process.env.MYSQL_PASSWORD],
        [
          "import",
          process.env.MYSQL_IMPORT_USER,
          process.env.MYSQL_IMPORT_PASSWORD,
        ],
      ]) {
        assert.ok(user && password);
        assert.match(user, /^findmydup_test_[a-z]+$/);
        await connection.query(
          "CREATE USER IF NOT EXISTS ?@'%' IDENTIFIED BY ?",
          [user, password],
        );
        await connection.query(
          "GRANT " +
            (role === "read" ? "SELECT" : "SELECT,INSERT,UPDATE,DELETE") +
            " ON ?? .* TO ?@'%'",
          ["findmydup_test", user],
        );
      }
      const retailerId = randomUUID(),
        categoryId = randomUUID();
      await connection.execute(
        "INSERT INTO categories (id,slug,name) VALUES (?,?,?)",
        [categoryId, "mode", "Test category, fixture only"],
      );
      await connection.execute(
        "INSERT INTO retailers (id,awin_merchant_id,name,website_domain,enabled) VALUES (?,?,?,?,1)",
        [
          retailerId,
          "123",
          "Test retailer, not a real shop",
          "shop.example.test",
        ],
      );
      const policy = {
        retailerId,
        merchantId: "123",
        imageHosts: ["cdn.example.test"],
        categoryBySource: { "Fixture category": "mode" },
      };
      const row = {
        merchant_id: "123",
        aw_product_id: "456",
        product_name: "Test fixture Tasche, not a real offer",
        description: "CI fixture only",
        search_price: "12.34",
        currency: "EUR",
        category_name: "Fixture category",
        aw_image_url: "https://cdn.example.test/fixture.png",
        aw_deep_link: "https://www.awin1.com/cread.php?awinmid=123",
        in_stock: "",
      };
      await importAwinBatch([row], policy);
      await importAwinBatch([{ ...row, search_price: "10.99" }], policy);
      const [counts] = await connection.execute<RowDataPacket[]>(
        "SELECT (SELECT COUNT(*) FROM products) products,(SELECT COUNT(*) FROM offers) offers,(SELECT COUNT(*) FROM prices) prices,(SELECT COUNT(*) FROM product_images) images,(SELECT COUNT(*) FROM affiliate_links) links",
      );
      assert.deepEqual(
        [
          counts[0].products,
          counts[0].offers,
          counts[0].prices,
          counts[0].images,
          counts[0].links,
        ].map(Number),
        [1, 1, 2, 1, 1],
      );
      const repository = catalogRepository(async (sql, values) => {
        const [rows] = await getDatabase("read").execute<
          (CatalogRow & RowDataPacket)[]
        >({ sql, timeout: 3000 }, values);
        return rows;
      });
      const result = await repository.search(
        parseSearch(
          new URLSearchParams(
            "q=tasche&category=mode&maxPrice=11&sort=price-asc",
          ),
        ),
      );
      assert.equal(result.offers.length, 1);
      assert.equal(result.offers[0].price.amountMinor, 1099);
      assert.equal(result.offers[0].availability, "unknown");
      assert.equal(
        (
          await repository.search(
            parseSearch(new URLSearchParams("q=not-present%25'")),
          )
        ).offers.length,
        0,
      );
      await assert.rejects(() =>
        getDatabase("read").execute("DELETE FROM prices"),
      );
      await assert.rejects(() =>
        importAwinBatch([{ ...row, aw_product_id: "789" }], {
          ...policy,
          categoryBySource: { "Fixture category": "missing-category" },
        }),
      );
      const [after] = await connection.execute<RowDataPacket[]>(
        "SELECT COUNT(*) n FROM products",
      );
      assert.equal(Number(after[0].n), 1);
      const [runs] = await connection.execute<RowDataPacket[]>(
        "SELECT COUNT(*) n FROM feed_runs WHERE status='failed'",
      );
      assert.equal(Number(runs[0].n), 1);
      await connection.execute(
        "UPDATE offers SET last_seen_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 10 DAY)",
      );
      assert.equal(
        (await repository.search(parseSearch(new URLSearchParams("q=tasche"))))
          .offers.length,
        0,
      );
      await connection.execute(
        "UPDATE offers SET last_seen_at=UTC_TIMESTAMP()",
      );
      await connection.execute(
        "UPDATE schema_migrations SET checksum=REPEAT('0',64)",
      );
      await assert.rejects(() => migrate(connection), /checksum/);
      console.log(
        "PASS: isolated MySQL migration, no seed offers, import deduplication and price history, rollback, least-privilege reads, filters, stale exclusion and migration integrity.",
      );
    } finally {
      connection.release();
      await closeDatabases();
    }
  },
);
