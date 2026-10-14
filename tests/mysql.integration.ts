import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import mysql, { type RowDataPacket } from "mysql2/promise";
import { databaseOptions } from "../server/db/config.ts";
import { getDatabase, closeDatabases } from "../server/db/connection.ts";
import { migrate } from "../server/db/migrations.ts";
import { checkStagingConnection } from "../server/db/readiness.ts";
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
      // Single-user cycle, using ONLY this disposable CI database.
      const singleUser = "findmydup_test_single";
      const singlePassword = "ci_ephemeral_single_password";
      await connection.query("CREATE USER ?@'%' IDENTIFIED BY ?", [singleUser, singlePassword]);
      await connection.query("GRANT SELECT,INSERT,CREATE,REFERENCES ON ?? .* TO ?@'%'", ["findmydup_test", singleUser]);
      const singleOptions = databaseOptions("migration", { ...process.env, MYSQL_MIGRATION_USER: singleUser, MYSQL_MIGRATION_PASSWORD: singlePassword });
      const maintenance = mysql.createPool(singleOptions);
      const elevated = await maintenance.getConnection();
      try {
        // Exercise the prepared phpMyAdmin bundle on the disposable CI target only.
        const bundle = await readFile("db/staging/hostinger-initial-schema.sql", "utf8");
        assert.ok(bundle.includes("USE `u874339379_findmyduptest`;"));
        const isolatedBundle = bundle.replace("USE `u874339379_findmyduptest`;", "USE `findmydup_test`;");
        for (const statement of isolatedBundle.split("-- statement-breakpoint").map((sql) => sql.trim()).filter(Boolean))
          await elevated.execute(statement);
        await migrate(elevated);
        await assert.rejects(() => checkStagingConnection(elevated, "findmydup_test", true), /SELECT/);
      } finally { elevated.release(); await maintenance.end(); }
      await connection.query("REVOKE ALL PRIVILEGES, GRANT OPTION FROM ?@'%'", [singleUser]);
      await connection.query("GRANT SELECT ON ?? .* TO ?@'%'", ["findmydup_test", singleUser]);
      const runtime = mysql.createPool({ ...singleOptions, user: singleUser, password: singlePassword });
      const restricted = await runtime.getConnection();
      try {
        assert.equal((await checkStagingConnection(restricted, "findmydup_test", true)).privileges, "read-only");
        await assert.rejects(() => restricted.execute("DELETE FROM products"));
        await assert.rejects(() => restricted.execute("CREATE TABLE forbidden_write (id INT)"));
        const [empty] = await restricted.execute<RowDataPacket[]>("SELECT COUNT(*) n FROM products");
        assert.equal(Number(empty[0].n), 0);
      } finally { restricted.release(); await runtime.end(); }
      console.log("PASS: same CI user applied empty migrations, elevated grants rejected, privileges reduced to SELECT, fresh read-only connection and denied DDL/DML.");
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
      const probe = await promisify(execFile)(process.execPath, ["--conditions=react-server", "--experimental-strip-types", "scripts/check-db.ts", "--confirm", "--database=findmydup_test", "--schema"], { env: { ...process.env, DEPLOYMENT_ENV: "staging", DB_CONNECTION_TEST_ENABLED: "true", DB_MIGRATIONS_ENABLED: "false", AWIN_IMPORT_ENABLED: "false" }, timeout: 15000 });
      assert.equal(JSON.parse(probe.stdout).schema, "verified");
      assert.equal(probe.stdout.includes(process.env.MYSQL_PASSWORD!), false);
      const reader = await getDatabase("read").getConnection();
      try {
        const before = await checkStagingConnection(reader, "findmydup_test", true);
        assert.equal(before.schema, "verified");
        await assert.rejects(() => checkStagingConnection(connection, "findmydup_test", true), /SELECT/);
      } finally { reader.release(); }
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
