import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { stagingTestOptions, supportedDatabase, readOnlyGrants } from "../server/db/readiness.ts";
const env = {
  DEPLOYMENT_ENV: "staging", DB_CONNECTION_TEST_ENABLED: "true",
  DATABASE_ACCESS_ENABLED: "true", MYSQL_HOST: "127.0.0.1",
  MYSQL_DATABASE: "findmydup_staging", MYSQL_USER: "staging_reader",
  MYSQL_PASSWORD: "test-only-placeholder",
};
test("connection probe refuses production, unconfirmed targets and enabled writes before connecting", () => {
  const args = ["--confirm", "--database=findmydup_staging"];
  assert.equal(stagingTestOptions(args, env).database, "findmydup_staging");
  for (const overrides of [{ DEPLOYMENT_ENV: "production" }, { DB_CONNECTION_TEST_ENABLED: "false" }, { MYSQL_DATABASE: "u874339379_findmydupde" }, { AWIN_IMPORT_ENABLED: "true" }, { DB_MIGRATIONS_ENABLED: "true" }])
    assert.throws(() => stagingTestOptions(args, { ...env, ...overrides }));
  for (const args of [[], ["--confirm"], ["--database=findmydup_staging"], ["--confirm", "--database=findmydup_staging", "--database=other"], ["--confirm", "--database=findmydup_staging", "--force"]])
    assert.throws(() => stagingTestOptions(args, env));
});
test("version gate identifies MySQL and MariaDB without accepting old compatibility versions", () => {
  for (const version of ["8.0.44", "8.4.7", "10.11.14-MariaDB", "5.5.5-10.11.14-MariaDB", "10.6.24-MariaDB"]) assert.equal(supportedDatabase(version), true);
  for (const version of ["5.7.44", "10.5.29-MariaDB", "unknown"]) assert.equal(supportedDatabase(version), false);
});
test("readiness requires SELECT-only grants on the staging catalog and does not accept roles or global access", () => {
  const select = "GRANT SELECT ON `findmydup_staging`.* TO 'reader'@'%'";
  assert.equal(readOnlyGrants(["GRANT USAGE ON *.* TO 'reader'@'%'", select], "findmydup_staging"), true);
  for (const grant of ["GRANT ALL PRIVILEGES ON `findmydup_staging`.* TO 'reader'@'%'", "GRANT SELECT, INSERT ON `findmydup_staging`.* TO 'reader'@'%'", "GRANT SELECT ON *.* TO 'reader'@'%'", select + " WITH GRANT OPTION", "GRANT 'admin'@'%' TO 'reader'@'%'"])
    assert.equal(readOnlyGrants([grant], "findmydup_staging"), false);
  assert.equal(readOnlyGrants([], "findmydup_staging"), false);
});

test("Hostinger staging name is explicitly accepted without broadening test-name matching", () => {
  const target = "u874339379_findmyduptest";
  const options = stagingTestOptions(["--confirm", "--database=" + target], { ...env, MYSQL_DATABASE: target, MYSQL_USER: target });
  assert.equal(options.database, target);
  assert.equal(options.user, target);
  for (const database of ["u874339379_findmydupde", "u874339379_findmyduptest_backup", "u874339379_findmyduptest2", "other_test"])
    assert.throws(() => stagingTestOptions(["--confirm", "--database=" + database], { ...env, MYSQL_DATABASE: database }));
});

test("offline phpMyAdmin bundle preserves the reviewed migration and recorded checksum and targets staging only", async () => {
  const migration = await readFile("db/migrations/001_catalog.sql", "utf8");
  const bundle = await readFile("db/staging/hostinger-initial-schema.sql", "utf8");
  assert.ok(bundle.includes(migration));
  assert.ok(bundle.includes(createHash("sha256").update(migration).digest("hex")));
  assert.match(bundle, /USE `u874339379_findmyduptest`;/);
  assert.equal(bundle.includes("u874339379_findmydupde"), false);
  assert.equal((bundle.match(/INSERT INTO/g) || []).length, 1);
  assert.match(bundle, /INSERT INTO schema_migrations/);
  assert.equal(bundle.includes("CREATE USER"), false);
  assert.equal(bundle.includes("GRANT "), false);
});
