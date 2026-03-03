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

  // Safety check: assert users.githubId column exists so the deploy never
  // silently succeeds with an incomplete schema.
  const [checkRows] = await pool.query(`
    SELECT COUNT(*) AS cnt
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'githubId'
  `);
  const columnExists = Number(checkRows[0]?.cnt ?? 0) > 0;
  if (!columnExists) {
    console.error(
      "[migrate] SAFETY CHECK FAILED: users.githubId column is missing after migration. Deploy aborted."
    );
    process.exitCode = 1;
  } else {
    console.log("[migrate] Migrations applied successfully.");
    console.log("[migrate] Safety check passed: users.githubId column exists.");
  }
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
