import { getDatabase, closeDatabases } from "../server/db/connection.ts";
import { migrate } from "../server/db/migrations.ts";
if (!process.argv.includes("--confirm")) {
  console.error(
    "Migration blocked. Review the target and use --confirm with explicit environment opt-in.",
  );
  process.exitCode = 1;
} else {
  try {
    const connection = await getDatabase("migration").getConnection();
    try {
      await migrate(connection);
      console.log("Reviewed migrations applied.");
    } finally {
      connection.release();
    }
  } catch {
    console.error(
      "Migration failed or is disabled. No connection details are logged. Review configuration and migration history.",
    );
    process.exitCode = 1;
  } finally {
    await closeDatabases();
  }
}
