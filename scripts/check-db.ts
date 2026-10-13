import { getDatabase, closeDatabases } from "../server/db/connection.ts";
import { stagingTestOptions, checkStagingConnection } from "../server/db/readiness.ts";

try {
  const args = process.argv.slice(2);
  const options = stagingTestOptions(args);
  const connection = await getDatabase("read").getConnection();
  try {
    console.log(JSON.stringify(await checkStagingConnection(connection, options.database, args.includes("--schema"))));
  } finally {
    connection.release();
  }
} catch {
  console.error("Staging connection test failed or blocked. Check the confirmed staging target, TLS, supported version, SELECT-only grants and migration history. No credentials or server errors are logged.");
  process.exitCode = 1;
} finally {
  await closeDatabases();
}
