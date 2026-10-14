import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { HOSTINGER_STAGING_DATABASE } from "./staging-target.ts";

type Environment = Readonly<Record<string, string | undefined>>;
const catalogTables = ["categories", "retailers", "products", "offers", "prices", "product_images", "affiliate_links", "feed_runs", "schema_migrations"];
const strictPrivileges = new Set(["SELECT"]);
const compatibilityPrivileges = new Set(["SELECT", "DELETE HISTORY", "SHOW CREATE ROUTINE"]);

function grantsAllowed(grants: string[], database: string, allowed: Set<string>, schemaOnly: boolean) {
  let select = false;
  return grants.length > 0 && grants.every((grant) => {
    const match = /^GRANT (.+?) ON (.+?) TO /i.exec(grant);
    if (!match || /WITH\s+GRANT\s+OPTION/i.test(grant)) return false;
    const privileges = match[1].split(",").map((p) => p.trim().toUpperCase());
    if (privileges.length === 1 && privileges[0] === "USAGE") return match[2] === "*.*";
    if (privileges.some((p) => !allowed.has(p))) return false;
    const scope = /^(?:`((?:``|[^`])+)`|([a-zA-Z0-9_]+))\.(\*|`(?:``|[^`])+`|[a-zA-Z0-9_]+)$/.exec(match[2]);
    if (!scope) return false;
    const rawSchema = scope[1] || scope[2];
    // In database GRANT scopes, unescaped '_'/'%' are wildcards, even in backticks.
    // Compatibility requires a literal schema grant, not a pattern matching other DBs.
    if (schemaOnly && /(?<!\\)[_%]/.test(rawSchema)) return false;
    const schema = rawSchema.replace(/``/g, "`").replace(/\\([_%])/g, "$1");
    if (schema !== database || (schemaOnly && scope[3] !== "*")) return false;
    if (privileges.includes("SELECT")) select = true;
    return true;
  }) && select;
}

export function readOnlyGrants(grants: string[], database: string) {
  return grantsAllowed(grants, database, strictPrivileges, false);
}

export function compatibilityGrants(grants: string[], database: string) {
  return database === HOSTINGER_STAGING_DATABASE && grantsAllowed(grants, database, compatibilityPrivileges, true);
}

export function compatibilityEnabled(database: string, env: Environment) {
  if (env.HOSTINGER_STAGING_GRANT_COMPATIBILITY !== "true") return false;
  if (env.DEPLOYMENT_ENV !== "staging" || database !== HOSTINGER_STAGING_DATABASE ||
      env.MYSQL_DATABASE !== HOSTINGER_STAGING_DATABASE || env.MYSQL_USER !== HOSTINGER_STAGING_DATABASE ||
      ["DB_MIGRATIONS_ENABLED", "AWIN_IMPORT_ENABLED", "IMAGE_SEARCH_ENABLED"].some((key) => env[key] === "true"))
    throw new Error("Staging compatibility configuration rejected");
  return true;
}

export async function requireReadOnlyAccount(
  connection: Pick<PoolConnection, "query">,
  database: string,
  env: Environment = process.env,
): Promise<"read-only" | "staging-compatibility"> {
  const compatible = compatibilityEnabled(database, env);
  const query = async (sql: string, values: string[] = []) => {
    const [rows] = await connection.query<RowDataPacket[]>({ sql, timeout: 3000 }, values);
    return rows;
  };
  const identity = await query("SELECT DATABASE() AS database_name, CURRENT_USER() AS authenticated_user, USER() AS login_user, VERSION() AS version");
  const current = identity[0];
  if (identity.length !== 1 || current?.database_name !== database)
    throw new Error("Database identity rejected");
  const rows = await query("SHOW GRANTS FOR CURRENT_USER");
  const grants = rows.map((row) => String(Object.values(row)[0]));
  if (!compatible) {
    if (!readOnlyGrants(grants, database)) throw new Error("Runtime account must have only SELECT and USAGE grants");
    return "read-only";
  }
  const principal = String(current.authenticated_user);
  const separator = principal.lastIndexOf("@");
  const username = principal.slice(0, separator), hostname = principal.slice(separator + 1);
  const login = String(current.login_user);
  const version = /^(?:5\.5\.5-)?(\d+)\.(\d+)\./.exec(String(current.version));
  const supportedMariaDB = /MariaDB/i.test(String(current.version)) && version &&
    (Number(version[1]) > 10 || (Number(version[1]) === 10 && Number(version[2]) >= 6));
  if (separator < 1 || !hostname || username !== HOSTINGER_STAGING_DATABASE ||
      login.slice(0, login.lastIndexOf("@")) !== HOSTINGER_STAGING_DATABASE)
    throw new Error("Staging compatibility authenticated user rejected");
  if (!supportedMariaDB)
    throw new Error("Staging compatibility server version rejected");
  if (!compatibilityGrants(grants, database)) {
    // Diagnostics only: an unescaped '_' in a database GRANT is a wildcard.
    // Do not disclose the grant or relax the actual privileges check.
    const rawScope = "ON `" + database + "`.* TO ";
    const unquotedScope = "ON " + database + ".* TO ";
    const wildcardScope = grants.some((grant) => grant.includes(rawScope) || grant.includes(unquotedScope));
    throw new Error(wildcardScope
      ? "Staging compatibility wildcard grant scope rejected"
      : "Staging compatibility grants rejected");
  }

  // Inspect effective privilege metadata for this authenticated principal, never a caller-supplied account.
  const grantee = "'" + username.replace(/'/g, "''") + "'@'" + hostname.replace(/'/g, "''") + "'";
  const globals = await query("SELECT PRIVILEGE_TYPE, IS_GRANTABLE FROM information_schema.USER_PRIVILEGES WHERE GRANTEE=?", [grantee]);
  if (globals.some((row) => row.PRIVILEGE_TYPE !== "USAGE" || row.IS_GRANTABLE !== "NO"))
    throw new Error("Global privileges rejected");
  const schemas = await query("SELECT TABLE_SCHEMA, PRIVILEGE_TYPE, IS_GRANTABLE FROM information_schema.SCHEMA_PRIVILEGES WHERE GRANTEE=?", [grantee]);
  if (!schemas.some((row) => row.PRIVILEGE_TYPE === "SELECT") || schemas.some((row) =>
    String(row.TABLE_SCHEMA).replace(/\\([_%])/g, "$1") !== database ||
    !compatibilityPrivileges.has(String(row.PRIVILEGE_TYPE)) || row.IS_GRANTABLE !== "NO"))
    throw new Error("Effective schema privileges rejected");
  for (const view of ["TABLE_PRIVILEGES", "COLUMN_PRIVILEGES"]) {
    const objectGrants = await query(`SELECT PRIVILEGE_TYPE FROM information_schema.${view} WHERE GRANTEE=?`, [grantee]);
    if (objectGrants.length !== 0) throw new Error("Object-specific privileges rejected");
  }

  // Database-wide SELECT is required above, so the entire schema inventory is visible.
  // Require the catalog inventory too; empty/filtered metadata cannot establish safety.
  const tables = await query("SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME LIMIT 257", [database]);
  if (tables.length < catalogTables.length || tables.length > 256 ||
      !catalogTables.every((name) => tables.some((table) => table.TABLE_NAME === name)) ||
      new Set(tables.map((table) => table.TABLE_NAME)).size !== tables.length ||
      tables.some((table) => table.TABLE_TYPE !== "BASE TABLE" || typeof table.TABLE_NAME !== "string"))
    throw new Error("Non-versioned schema inventory not established");
  for (const table of tables) {
    const name = String(table.TABLE_NAME).replace(/`/g, "``");
    const definitions = await query(`SHOW CREATE TABLE \`${database}\`.\`${name}\``);
    const definition = definitions[0]?.["Create Table"];
    if (definitions.length !== 1 || typeof definition !== "string" || !/^CREATE TABLE\s/i.test(definition) ||
        /SYSTEM\s+VERSIONING|PERIOD\s+FOR\s+SYSTEM_TIME|AS\s+ROW\s+(?:START|END)/i.test(definition))
      throw new Error("Non-versioned table definition not established");
  }
  return "staging-compatibility";
}
