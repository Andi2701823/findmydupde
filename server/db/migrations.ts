import "server-only";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
export async function migrate(
  connection: PoolConnection,
  directory = resolve("db/migrations"),
) {
  const [locks] = await connection.execute<RowDataPacket[]>(
    "SELECT GET_LOCK(CONCAT(DATABASE(), ':findmydup:migrations'), 10) AS acquired",
  );
  if (Number(locks[0]?.acquired) !== 1)
    throw new Error("Migration lock unavailable");
  try {
    await connection.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) NOT NULL PRIMARY KEY, checksum CHAR(64) NOT NULL,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    const [history] = await connection.execute<RowDataPacket[]>(
      "SELECT version,checksum FROM schema_migrations",
    );
    const applied = new Map(
      history.map((row) => [String(row.version), String(row.checksum)]),
    );
    const names = (await readdir(directory))
      .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
      .sort();
    for (const name of names) {
      const sql = await readFile(resolve(directory, name), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      if (applied.has(name)) {
        if (applied.get(name) !== hash)
          throw new Error("Applied migration checksum mismatch");
        continue;
      }
      for (const statement of sql
        .split("-- statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean))
        await connection.execute(statement);
      await connection.execute(
        "INSERT INTO schema_migrations (version,checksum) VALUES (?,?)",
        [name, hash],
      );
    }
  } finally {
    await connection.execute(
      "SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':findmydup:migrations'))",
    );
  }
}
