import test from "node:test";
import assert from "node:assert/strict";
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
