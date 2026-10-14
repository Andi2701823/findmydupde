import test from "node:test";
import assert from "node:assert/strict";
import type { PoolConnection } from "mysql2/promise";
import { compatibilityEnabled, compatibilityGrants, readOnlyGrants, requireReadOnlyAccount } from "../server/db/privileges.ts";
const database = "u874339379_findmyduptest";
const env = { DEPLOYMENT_ENV: "staging", MYSQL_DATABASE: database, MYSQL_USER: database, HOSTINGER_STAGING_GRANT_COMPATIBILITY: "true" };
const grant = `GRANT SELECT, DELETE HISTORY, SHOW CREATE ROUTINE ON \`${database}\`.* TO 'user'@'%'`;
const names = ["categories", "retailers", "products", "offers", "prices", "product_images", "affiliate_links", "feed_runs", "schema_migrations"];
function fixture(overrides: { identity?: Record<string, unknown>; grants?: string[]; metadata?: Record<string, unknown>[]; globals?: Record<string, unknown>[]; objects?: Record<string, unknown>[]; tables?: Record<string, unknown>[]; definition?: unknown; fail?: string } = {}) {
  const calls: string[] = [];
  const connection = { async query(options: { sql: string }) {
    const sql = options.sql; calls.push(sql);
    if (overrides.fail && sql.includes(overrides.fail)) throw new Error("metadata unavailable");
    let rows: unknown;
    if (sql.startsWith("SELECT DATABASE()")) rows = [{ database_name: database, authenticated_user: database + "@127.0.0.1", login_user: database + "@localhost", version: "11.4.8-MariaDB", ...overrides.identity }];
    else if (sql.startsWith("SHOW GRANTS")) rows = (overrides.grants || ["GRANT USAGE ON *.* TO 'user'@'%'", grant]).map((g) => ({ grants: g }));
    else if (sql.includes("USER_PRIVILEGES")) rows = overrides.globals || [];
    else if (sql.includes("TABLE_PRIVILEGES") || sql.includes("COLUMN_PRIVILEGES")) rows = overrides.objects || [];
    else if (sql.includes("SCHEMA_PRIVILEGES")) rows = overrides.metadata || ["SELECT", "DELETE HISTORY", "SHOW CREATE ROUTINE"].map((p) => ({ TABLE_SCHEMA: database, PRIVILEGE_TYPE: p, IS_GRANTABLE: "NO" }));
    else if (sql.includes("information_schema.TABLES ")) rows = overrides.tables || names.map((name) => ({ TABLE_NAME: name, TABLE_TYPE: "BASE TABLE" }));
    else if (sql.startsWith("SHOW CREATE TABLE")) rows = [{ "Create Table": overrides.definition === undefined ? "CREATE TABLE `test` (`id` int) ENGINE=InnoDB" : overrides.definition }];
    else rows = [];
    return [rows, []];
  } } as unknown as Pick<PoolConnection, "query">;
  return { connection, calls };
}
test("compatibility is disabled by default and cannot be enabled for other environments, accounts, databases or write features", () => {
  assert.equal(compatibilityEnabled(database, {}), false);
  assert.equal(compatibilityEnabled(database, env), true);
  for (const value of [{ DEPLOYMENT_ENV: "production" }, { MYSQL_DATABASE: "u874339379_findmydupde" }, { MYSQL_USER: "other" }, { DB_MIGRATIONS_ENABLED: "true" }, { AWIN_IMPORT_ENABLED: "true" }, { IMAGE_SEARCH_ENABLED: "true" }])
    assert.throws(() => compatibilityEnabled(database, { ...env, ...value }));
  assert.throws(() => compatibilityEnabled("other_staging", env));
});
test("strict grants remain strict, compatible grants are exact and scoped to the fixed schema", () => {
  assert.equal(readOnlyGrants([grant], database), false);
  assert.equal(compatibilityGrants([grant], database), true);
  for (const privilege of ["INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "EXECUTE", "TRIGGER", "CREATE TEMPORARY TABLES", "FILE", "SUPER", "ALL PRIVILEGES", "SELECT (id)"])
    assert.equal(compatibilityGrants([grant.replace("SELECT, DELETE HISTORY, SHOW CREATE ROUTINE", "SELECT, " + privilege)], database), false);
  for (const rejected of [grant.replace(database, "foreign"), grant.replace("`" + database + "`.*", "*.*"), grant.replace("`" + database + "`.*", "`" + database + "`.products"), grant + " WITH GRANT OPTION", "GRANT 'role' TO 'user'@'%'", "GRANT USAGE ON foreign.* TO 'user'@'%'"])
    assert.equal(compatibilityGrants([grant, rejected], database), false);
});
test("compatibility verifies actual identities, effective metadata and non-versioned definitions using only SELECT/SHOW", async () => {
  const { connection, calls } = fixture();
  assert.equal(await requireReadOnlyAccount(connection, database, env), "staging-compatibility");
  assert.equal(calls.filter((sql) => sql.startsWith("SHOW CREATE TABLE")).length, names.length);
  assert.ok(calls.every((sql) => /^(SELECT|SHOW)\b/.test(sql)));
  await assert.rejects(() => requireReadOnlyAccount(connection, database, {}), /SELECT/);
  for (const identity of [{ database_name: "production" }, { authenticated_user: "other@localhost" }, { login_user: "other@localhost" }, { authenticated_user: "@localhost" }, { version: "8.0.44" }])
    await assert.rejects(() => requireReadOnlyAccount(fixture({ identity }).connection, database, env));
});
test("uncertain metadata, hidden tables and system versioning fail closed", async () => {
  for (const fail of ["SHOW GRANTS", "USER_PRIVILEGES", "SCHEMA_PRIVILEGES", "TABLE_PRIVILEGES", "COLUMN_PRIVILEGES", "information_schema.TABLES ", "SHOW CREATE TABLE"])
    await assert.rejects(() => requireReadOnlyAccount(fixture({ fail }).connection, database, env));
  for (const tables of [[], names.slice(1).map((name) => ({ TABLE_NAME: name, TABLE_TYPE: "BASE TABLE" })), names.map((name) => ({ TABLE_NAME: name, TABLE_TYPE: name === "products" ? "SYSTEM VERSIONED" : "BASE TABLE" })), names.map((name) => ({ TABLE_NAME: name, TABLE_TYPE: "VIEW" }))])
    await assert.rejects(() => requireReadOnlyAccount(fixture({ tables }).connection, database, env));
  for (const definition of [null, "", "CREATE TABLE test(id int) WITH SYSTEM VERSIONING", "CREATE TABLE test(id int, PERIOD FOR SYSTEM_TIME(a,b))"])
    await assert.rejects(() => requireReadOnlyAccount(fixture({ definition }).connection, database, env));
});
test("effective privileges cannot contradict a superficially allowed SHOW GRANTS response", async () => {
  for (const globals of [[{ PRIVILEGE_TYPE: "SELECT", IS_GRANTABLE: "NO" }], [{ PRIVILEGE_TYPE: "USAGE", IS_GRANTABLE: "YES" }]])
    await assert.rejects(() => requireReadOnlyAccount(fixture({ globals }).connection, database, env));
  await assert.rejects(() => requireReadOnlyAccount(fixture({ objects: [{ PRIVILEGE_TYPE: "INSERT" }] }).connection, database, env));
  for (const metadata of [[], [{ TABLE_SCHEMA: database, PRIVILEGE_TYPE: "SELECT", IS_GRANTABLE: "YES" }], [{ TABLE_SCHEMA: "other", PRIVILEGE_TYPE: "SELECT", IS_GRANTABLE: "NO" }], [{ TABLE_SCHEMA: database, PRIVILEGE_TYPE: "INSERT", IS_GRANTABLE: "NO" }]])
    await assert.rejects(() => requireReadOnlyAccount(fixture({ metadata }).connection, database, env));
});
