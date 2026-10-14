import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";

export function readOnlyGrants(grants: string[], database: string) {
  let select = false;
  return grants.length > 0 && grants.every((grant) => {
    const match = /^GRANT (USAGE|SELECT) ON (.+?) TO /i.exec(grant);
    if (!match || /WITH GRANT OPTION/i.test(grant)) return false;
    if (match[1].toUpperCase() === "USAGE") return true;
    const scope = match[2].replace(/`/g, "").replace(/\\([_%])/g, "$1");
    if (!scope.startsWith(database + ".")) return false;
    select = true;
    return true;
  }) && select;
}

export async function requireReadOnlyAccount(
  connection: Pick<PoolConnection, "query">,
  database: string,
) {
  const [rows] = await connection.query<RowDataPacket[]>({
    sql: "SHOW GRANTS FOR CURRENT_USER",
    timeout: 3000,
  });
  if (!readOnlyGrants(rows.map((row) => String(Object.values(row)[0])), database))
    throw new Error("Runtime account must have only SELECT and USAGE grants");
}
