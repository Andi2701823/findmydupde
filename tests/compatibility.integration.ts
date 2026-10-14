import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import mysql from "mysql2/promise";
import { requireReadOnlyAccount } from "../server/db/privileges.ts";
const enabled = process.env.TEST_HOSTINGER_COMPATIBILITY_ENABLED === "true";
test("isolated MariaDB Hostinger identity, effective grants, versioned tables and actual Next.js API", { skip: !enabled }, async () => {
  assert.equal(process.env.MYSQL_HOST, "127.0.0.1");
  assert.equal(process.env.MYSQL_DATABASE, "findmydup_test");
  const database = "u874339379_findmyduptest", password = "ci_ephemeral_compatibility_password";
  const literalGrantScope = database.replace(/_/g, "\\_");
  const administrator = await mysql.createConnection({ host: "127.0.0.1", port: 3306, user: "root", password: process.env.MYSQL_MIGRATION_PASSWORD, database: "findmydup_test" });
  const env = { ...process.env, DEPLOYMENT_ENV: "staging", MYSQL_HOST: "127.0.0.1", MYSQL_DATABASE: database, MYSQL_USER: database, MYSQL_PASSWORD: password, MYSQL_TLS_MODE: "disabled", HOSTINGER_STAGING_GRANT_COMPATIBILITY: "true", DATABASE_ACCESS_ENABLED: "true", CATALOG_SEARCH_ENABLED: "true", DB_MIGRATIONS_ENABLED: "false", AWIN_IMPORT_ENABLED: "false", IMAGE_SEARCH_ENABLED: "false" };
  let server: ChildProcess | undefined;
  let reader: Awaited<ReturnType<typeof mysql.createConnection>> | undefined;
  async function stop() {
    const child = server; server = undefined;
    if (!child || child.exitCode !== null) return;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 5000);
      child.once("exit", () => { clearTimeout(timer); resolve(); });
      child.kill("SIGTERM");
    });
  }
  async function start(overrides: Record<string, string> = {}) {
    await stop();
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"], { stdio: "ignore", env: { ...env, PORT: "3221", ...overrides } });
    for (let i = 0; i < 200; i++) {
      try { if ((await fetch("http://127.0.0.1:3221/")).ok) return; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("CI Next.js server did not start");
  }
  const search = () => fetch("http://127.0.0.1:3221/api/products/search/?q=tasche");
  try {
    await administrator.query("CREATE DATABASE ??", [database]);
    await administrator.query("CREATE USER ?@'%' IDENTIFIED BY ?", [database, password]);
    const bundle = await readFile("db/staging/hostinger-initial-schema.sql", "utf8");
    for (const sql of bundle.split("-- statement-breakpoint").map((s) => s.trim()).filter(Boolean)) await administrator.query(sql);
    await administrator.query("GRANT SELECT, DELETE HISTORY, SHOW CREATE ROUTINE ON ?? .* TO ?@'%'", [literalGrantScope, database]);
    reader = await mysql.createConnection({ host: "127.0.0.1", user: database, password, database });
    assert.equal(await requireReadOnlyAccount(reader, database, env), "staging-compatibility");
    await assert.rejects(() => requireReadOnlyAccount(reader!, database, { ...env, HOSTINGER_STAGING_GRANT_COMPATIBILITY: "false" }));
    await assert.rejects(() => reader!.query("DELETE FROM products WHERE 1=0"));
    await start({ HOSTINGER_STAGING_GRANT_COMPATIBILITY: "false" });
    assert.equal((await search()).status, 503);
    await start();
    const result = await search(); assert.equal(result.status, 200); assert.deepEqual((await result.json()).offers, []);
    await administrator.query("CREATE TABLE ?? (id INT) WITH SYSTEM VERSIONING", [database + ".temporal_probe"]);
    await assert.rejects(() => requireReadOnlyAccount(reader!, database, env));
    assert.equal((await search()).status, 503);
    await administrator.query("DROP TABLE ??", [database + ".temporal_probe"]);
    for (const [privilege, scope] of [["INSERT", database], ["SELECT", "findmydup_test"]]) {
      await administrator.query("GRANT " + privilege + " ON ?? .* TO ?@'%'", [scope, database]);
      await assert.rejects(() => requireReadOnlyAccount(reader!, database, env));
      assert.equal((await search()).status, 503);
      await administrator.query("REVOKE " + privilege + " ON ?? .* FROM ?@'%'", [scope, database]);
    }
    await administrator.query("GRANT SHOW DATABASES ON *.* TO ?@'%'", [database]);
    await assert.rejects(() => requireReadOnlyAccount(reader!, database, env));
    assert.equal((await search()).status, 503);
    await administrator.query("REVOKE SHOW DATABASES ON *.* FROM ?@'%'", [database]);
    await start({ DEPLOYMENT_ENV: "production" });
    assert.equal((await search()).status, 503);
    await start({ DEPLOYMENT_ENV: "production", HOSTINGER_STAGING_GRANT_COMPATIBILITY: "false" });
    assert.equal((await search()).status, 503);
    await start({ MYSQL_DATABASE: "findmydup_test" });
    assert.equal((await search()).status, 503);
    await administrator.query("REVOKE DELETE HISTORY, SHOW CREATE ROUTINE ON ?? .* FROM ?@'%'", [literalGrantScope, database]);
    await start({ DEPLOYMENT_ENV: "production", HOSTINGER_STAGING_GRANT_COMPATIBILITY: "false" });
    assert.equal((await search()).status, 200);
    console.log("PASS: isolated MariaDB 11.4 compatibility account, strict/production rejection, real grants, empty catalog, versioned-table rejection and write/global/cross-database rejection through Next.js.");
  } finally { await stop(); await reader?.end(); await administrator.end(); }
});
