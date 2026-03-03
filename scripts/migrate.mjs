// Production-safe migration runner — no drizzle-kit required.
// Uses drizzle-orm/mysql2 migrator to apply committed SQL migrations from ./drizzle/.
import "dotenv/config";
import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[migrate] DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const tidbCaPem = (process.env.TIDB_CA_PEM ?? "").replace(/\\n/g, "\n").trim() || undefined;

const pool = createPool(
  tidbCaPem
    ? { uri: connectionString, ssl: { ca: tidbCaPem, rejectUnauthorized: true } }
    : { uri: connectionString }
);

const db = drizzle(pool);

const migrationsFolder = join(__dirname, "..", "drizzle");

console.log("[migrate] Applying migrations from", migrationsFolder);

try {
  await migrate(db, { migrationsFolder });
  console.log("[migrate] Migrations applied successfully.");
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
