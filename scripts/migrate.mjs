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

// Columns required by current code that may be missing from production DBs
// created by older migrations.
const REQUIRED_CAMPAIGNS_COLUMNS = [
  {
    name: "battlesPerPhase",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `battlesPerPhase` int NOT NULL DEFAULT 3",
  },
  {
    name: "strategicPointsForVictory",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `strategicPointsForVictory` int NOT NULL DEFAULT 10",
  },
  {
    name: "currentNarrativeObjective",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `currentNarrativeObjective` varchar(100) NOT NULL DEFAULT 'establishing_the_front'",
  },
  {
    name: "battlePhotos",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `battlePhotos` text",
  },
  {
    name: "phase1Result",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `phase1Result` enum('success','failure','pending') DEFAULT 'pending'",
  },
  {
    name: "phase2Result",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `phase2Result` enum('success','failure','pending') DEFAULT 'pending'",
  },
  {
    name: "phase3Result",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `phase3Result` enum('success','failure','pending') DEFAULT 'pending'",
  },
  {
    name: "phase4Result",
    alter: "ALTER TABLE `campaigns` ADD COLUMN `phase4Result` enum('success','failure','pending') DEFAULT 'pending'",
  },
];

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

  // ── Self-heal campaigns schema ────────────────────────────────────────────
  // Production DBs created by older migrations are missing columns required by
  // current code.  Check each one and ADD it if absent (idempotent).

  // Guard: only self-heal if the campaigns table was actually created by migrations.
  const [tableCheckRows] = await pool.query(`
    SELECT COUNT(*) AS cnt
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'campaigns'
  `);
  const campaignsTableExists = Number(tableCheckRows[0]?.cnt ?? 0) > 0;

  if (!campaignsTableExists) {
    console.error(
      "[migrate] SAFETY CHECK FAILED: campaigns table is missing after migration. Deploy aborted."
    );
    process.exitCode = 1;
  } else {
    const [existingColRows] = await pool.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'campaigns'
    `);
    const existingCols = new Set(existingColRows.map((r) => r.COLUMN_NAME));

    let schemaFixed = false;

    for (const col of REQUIRED_CAMPAIGNS_COLUMNS) {
      if (!existingCols.has(col.name)) {
        console.log(`[migrate] Adding missing column campaigns.${col.name}...`);
        await pool.query(col.alter);
        schemaFixed = true;
      }
    }

    // Fix currentPhase default: current schema requires DEFAULT 1.
    // Repair whenever the default is anything other than 1 (including NULL or legacy 0).
    const [phaseColRows] = await pool.query(`
      SELECT COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'campaigns'
        AND COLUMN_NAME = 'currentPhase'
    `);
    const currentPhaseDefault =
      phaseColRows.length > 0
        ? phaseColRows[0].COLUMN_DEFAULT !== null
          ? String(phaseColRows[0].COLUMN_DEFAULT)
          : null
        : null;
    if (currentPhaseDefault !== "1") {
      console.log(
        `[migrate] Fixing campaigns.currentPhase default (was: ${currentPhaseDefault ?? "NULL"}) → 1...`
      );
      await pool.query(
        "ALTER TABLE `campaigns` MODIFY COLUMN `currentPhase` int NOT NULL DEFAULT 1"
      );
      schemaFixed = true;
    }

    // Migrate existing rows that have currentPhase = 0 to 1.
    const [updateResult] = await pool.query(
      "UPDATE `campaigns` SET `currentPhase` = 1 WHERE `currentPhase` = 0"
    );
    if (updateResult.affectedRows > 0) {
      console.log(
        `[migrate] Updated ${updateResult.affectedRows} campaign(s): currentPhase 0 → 1.`
      );
      schemaFixed = true;
    }

    // Final safety check: verify all required columns now exist and currentPhase default is 1.
    const requiredNames = REQUIRED_CAMPAIGNS_COLUMNS.map((c) => c.name);
    const placeholders = requiredNames.map(() => "?").join(", ");
    const [verifyRows] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'campaigns'
         AND COLUMN_NAME IN (${placeholders})`,
      requiredNames
    );
    const foundCount = Number(verifyRows[0]?.cnt ?? 0);

    const [verifyPhaseRows] = await pool.query(`
      SELECT COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'campaigns'
        AND COLUMN_NAME = 'currentPhase'
    `);
    const verifiedPhaseDefault =
      verifyPhaseRows.length > 0
        ? verifyPhaseRows[0].COLUMN_DEFAULT !== null
          ? String(verifyPhaseRows[0].COLUMN_DEFAULT)
          : null
        : null;
    const phaseDefaultOk = verifiedPhaseDefault === "1";

    if (foundCount < requiredNames.length) {
      console.error(
        `[migrate] SAFETY CHECK FAILED: campaigns schema is still incomplete ` +
          `(${foundCount}/${requiredNames.length} required columns found). Deploy aborted.`
      );
      process.exitCode = 1;
    } else if (!phaseDefaultOk) {
      console.error(
        `[migrate] SAFETY CHECK FAILED: campaigns.currentPhase default is not 1 ` +
          `(found: ${verifiedPhaseDefault ?? "NULL"}). Deploy aborted.`
      );
      process.exitCode = 1;
    } else if (schemaFixed) {
      console.log("[migrate] campaigns schema fixed.");
    } else {
      console.log("[migrate] campaigns schema OK.");
    }
  }
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
