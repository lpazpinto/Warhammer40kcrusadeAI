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

const REQUIRED_PLAYERS_COLUMNS = [
  {
    name: "userId",
    alter: "ALTER TABLE `players` ADD COLUMN `userId` int NOT NULL DEFAULT 0",
  },
  {
    name: "crusadeForceName",
    alter: "ALTER TABLE `players` ADD COLUMN `crusadeForceName` varchar(255)",
  },
  {
    name: "armyBadge",
    alter: "ALTER TABLE `players` ADD COLUMN `armyBadge` varchar(500)",
  },
  {
    name: "requisitionPoints",
    alter: "ALTER TABLE `players` ADD COLUMN `requisitionPoints` int NOT NULL DEFAULT 0",
  },
  {
    name: "supplyLimit",
    alter: "ALTER TABLE `players` ADD COLUMN `supplyLimit` int NOT NULL DEFAULT 1000",
  },
  {
    name: "battleTally",
    alter: "ALTER TABLE `players` ADD COLUMN `battleTally` int NOT NULL DEFAULT 0",
  },
  {
    name: "victories",
    alter: "ALTER TABLE `players` ADD COLUMN `victories` int NOT NULL DEFAULT 0",
  },
  {
    name: "supplyPoints",
    alter: "ALTER TABLE `players` ADD COLUMN `supplyPoints` int NOT NULL DEFAULT 0",
  },
  {
    name: "commandPoints",
    alter: "ALTER TABLE `players` ADD COLUMN `commandPoints` int NOT NULL DEFAULT 2",
  },
  {
    name: "secretObjective",
    alter: "ALTER TABLE `players` ADD COLUMN `secretObjective` text",
  },
  {
    name: "secretObjectiveRevealed",
    alter: "ALTER TABLE `players` ADD COLUMN `secretObjectiveRevealed` tinyint(1) NOT NULL DEFAULT 0",
  },
  {
    name: "isAlive",
    alter: "ALTER TABLE `players` ADD COLUMN `isAlive` tinyint(1) NOT NULL DEFAULT 1",
  },
  {
    name: "isReady",
    alter: "ALTER TABLE `players` ADD COLUMN `isReady` tinyint(1) NOT NULL DEFAULT 0",
  },
];

const REQUIRED_BATTLES_COLUMNS = [
  {
    name: "currentTurn",
    alter: "ALTER TABLE `battles` ADD COLUMN `currentTurn` enum('horde','player') DEFAULT 'horde'",
    expected: { DATA_TYPE: "enum", COLUMN_TYPE: "enum('horde','player')", IS_NULLABLE: "YES", COLUMN_DEFAULT: "horde" },
  },
  {
    name: "currentPhase",
    alter: "ALTER TABLE `battles` ADD COLUMN `currentPhase` varchar(50) DEFAULT 'command'",
    expected: { DATA_TYPE: "varchar", COLUMN_TYPE: "varchar(50)", IS_NULLABLE: "YES", COLUMN_DEFAULT: "command" },
  },
  {
    name: "currentPhaseStep",
    alter: "ALTER TABLE `battles` ADD COLUMN `currentPhaseStep` varchar(100) DEFAULT 'start'",
    expected: { DATA_TYPE: "varchar", COLUMN_TYPE: "varchar(100)", IS_NULLABLE: "YES", COLUMN_DEFAULT: "start" },
  },
  {
    name: "playerTurn",
    alter: "ALTER TABLE `battles` ADD COLUMN `playerTurn` enum('player','opponent') DEFAULT 'opponent'",
    expected: { DATA_TYPE: "enum", COLUMN_TYPE: "enum('player','opponent')", IS_NULLABLE: "YES", COLUMN_DEFAULT: "opponent" },
  },
  {
    name: "objectivesControlled",
    alter: "ALTER TABLE `battles` ADD COLUMN `objectivesControlled` int NOT NULL DEFAULT 0",
    // COLUMN_TYPE intentionally omitted: MySQL/TiDB can report "int" or "int(11)"; DATA_TYPE is sufficient.
    expected: { DATA_TYPE: "int", IS_NULLABLE: "NO", COLUMN_DEFAULT: "0" },
  },
];

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

  // ── Self-heal players schema ──────────────────────────────────────────────
  // Production DBs created by older migrations may be missing columns required
  // by current code.  Check each one and ADD it if absent (idempotent).

  const [playersTableCheckRows] = await pool.query(`
    SELECT COUNT(*) AS cnt
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'players'
  `);
  const playersTableExists = Number(playersTableCheckRows[0]?.cnt ?? 0) > 0;

  if (!playersTableExists) {
    console.error(
      "[migrate] SAFETY CHECK FAILED: players table is missing after migration. Deploy aborted."
    );
    process.exitCode = 1;
  } else {
    const [existingPlayerColRows] = await pool.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'players'
    `);
    const existingPlayerCols = new Set(existingPlayerColRows.map((r) => r.COLUMN_NAME));

    let playersSchemaFixed = false;

    for (const col of REQUIRED_PLAYERS_COLUMNS) {
      if (!existingPlayerCols.has(col.name)) {
        console.log(`[migrate] Adding missing column players.${col.name}...`);
        try {
          await pool.query(col.alter);
          playersSchemaFixed = true;
        } catch (error) {
          // Make self-heal loop idempotent under concurrent deploys:
          // if another process added the column first, ignore duplicate-column errors.
          const err = /** @type {any} */ (error);
          if (err && (err.code === "ER_DUP_FIELDNAME" || err.errno === 1060)) {
            console.warn(
              `[migrate] Column players.${col.name} already exists (duplicate column error). Ignoring.`
            );
            // Column exists now; final safety check will confirm.
            continue;
          }
          throw error;
        }
      }
    }

    // Enforce players.userId contract: must be int NOT NULL DEFAULT 0.
    // If an older nullable/no-default column already existed the ADD COLUMN
    // loop would have skipped it, leaving schema drift.
    const [userIdDefRows] = await pool.query(`
      SELECT IS_NULLABLE, COLUMN_DEFAULT, DATA_TYPE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'players'
        AND COLUMN_NAME = 'userId'
    `);
    const userIdDef = userIdDefRows[0];
    const mustFixUserId =
      !userIdDef ||
      userIdDef.IS_NULLABLE !== "NO" ||
      String(userIdDef.COLUMN_DEFAULT ?? "") !== "0" ||
      userIdDef.DATA_TYPE !== "int";

    if (mustFixUserId) {
      console.log("[migrate] Enforcing players.userId contract (int NOT NULL DEFAULT 0)...");
      await pool.query("UPDATE `players` SET `userId` = 0 WHERE `userId` IS NULL");
      await pool.query(
        "ALTER TABLE `players` MODIFY COLUMN `userId` int NOT NULL DEFAULT 0"
      );
      playersSchemaFixed = true;
    }

    // Final safety check: verify all required columns now exist.
    const requiredPlayerNames = REQUIRED_PLAYERS_COLUMNS.map((c) => c.name);
    const playerPlaceholders = requiredPlayerNames.map(() => "?").join(", ");
    const [verifyPlayerRows] = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'players'
         AND COLUMN_NAME IN (${playerPlaceholders})`,
      requiredPlayerNames
    );
    const foundPlayerCount = Number(verifyPlayerRows[0]?.cnt ?? 0);

    if (foundPlayerCount < requiredPlayerNames.length) {
      console.error(
        `[migrate] SAFETY CHECK FAILED: players schema is still incomplete ` +
          `(${foundPlayerCount}/${requiredPlayerNames.length} required columns found). Deploy aborted.`
      );
      process.exitCode = 1;
    } else if (playersSchemaFixed) {
      console.log("[migrate] players schema fixed.");
    } else {
      console.log("[migrate] players schema OK.");
    }
  }
  // ── Self-heal battles schema ──────────────────────────────────────────────
  // Production DBs created by older migrations are missing columns required by
  // current code.  Check each one and ADD it if absent (idempotent).

  const [battlesTableCheckRows] = await pool.query(`
    SELECT COUNT(*) AS cnt
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'battles'
  `);
  const battlesTableExists = Number(battlesTableCheckRows[0]?.cnt ?? 0) > 0;

  if (!battlesTableExists) {
    console.error(
      "[migrate] SAFETY CHECK FAILED: battles table is missing after migration. Deploy aborted."
    );
    process.exitCode = 1;
  } else {
    const [existingBattlesColRows] = await pool.query(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'battles'
    `);
    const existingBattlesCols = new Set(existingBattlesColRows.map((r) => r.COLUMN_NAME));

    let battlesSchemaFixed = false;

    for (const col of REQUIRED_BATTLES_COLUMNS) {
      if (!existingBattlesCols.has(col.name)) {
        console.log(`[migrate] Adding missing column battles.${col.name}...`);
        try {
          await pool.query(col.alter);
          battlesSchemaFixed = true;
        } catch (error) {
          // Make self-heal loop idempotent under concurrent deploys:
          // if another process added the column first, ignore duplicate-column errors.
          const err = /** @type {any} */ (error);
          if (err && (err.code === "ER_DUP_FIELDNAME" || err.errno === 1060)) {
            console.warn(
              `[migrate] Column battles.${col.name} already exists (duplicate column error). Ignoring.`
            );
            continue;
          }
          throw error;
        }
      }
    }

    // Final safety check: verify all required columns exist and their contract
    // (DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT) matches the schema.
    const requiredBattlesNames = REQUIRED_BATTLES_COLUMNS.map((c) => c.name);
    const battlesPlaceholders = requiredBattlesNames.map(() => "?").join(", ");
    const [verifyBattlesRows] = await pool.query(
      `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'battles'
         AND COLUMN_NAME IN (${battlesPlaceholders})`,
      requiredBattlesNames
    );
    const foundBattlesCount = verifyBattlesRows.length;

    if (foundBattlesCount < requiredBattlesNames.length) {
      console.error(
        `[migrate] SAFETY CHECK FAILED: battles schema is still incomplete ` +
          `(${foundBattlesCount}/${requiredBattlesNames.length} required columns found). Deploy aborted.`
      );
      process.exitCode = 1;
    } else {
      // All columns exist — validate type/nullability/default contract.
      const battlesActualMap = Object.fromEntries(
        verifyBattlesRows.map((r) => [r.COLUMN_NAME, r])
      );
      const contractErrors = [];
      for (const col of REQUIRED_BATTLES_COLUMNS) {
        const actual = battlesActualMap[col.name];
        const exp = col.expected;
        if (actual.DATA_TYPE !== exp.DATA_TYPE) {
          contractErrors.push(
            `battles.${col.name}: DATA_TYPE expected '${exp.DATA_TYPE}', got '${actual.DATA_TYPE}'`
          );
        }
        if (exp.COLUMN_TYPE !== undefined && actual.COLUMN_TYPE !== exp.COLUMN_TYPE) {
          contractErrors.push(
            `battles.${col.name}: COLUMN_TYPE expected '${exp.COLUMN_TYPE}', got '${actual.COLUMN_TYPE}'`
          );
        }
        if (actual.IS_NULLABLE !== exp.IS_NULLABLE) {
          contractErrors.push(
            `battles.${col.name}: IS_NULLABLE expected '${exp.IS_NULLABLE}', got '${actual.IS_NULLABLE}'`
          );
        }
        // Normalize COLUMN_DEFAULT: information_schema may return a string or number;
        // exp.COLUMN_DEFAULT is always a string or null.
        const normalizedDefault =
          actual.COLUMN_DEFAULT !== null ? String(actual.COLUMN_DEFAULT) : null;
        if (normalizedDefault !== exp.COLUMN_DEFAULT) {
          contractErrors.push(
            `battles.${col.name}: COLUMN_DEFAULT expected '${exp.COLUMN_DEFAULT ?? "NULL"}', got '${normalizedDefault ?? "NULL"}'`
          );
        }
      }
      if (contractErrors.length > 0) {
        console.error(
          `[migrate] SAFETY CHECK FAILED: battles schema contract violations:\n  ` +
            contractErrors.join("\n  ")
        );
        process.exitCode = 1;
      } else if (battlesSchemaFixed) {
        console.log("[migrate] battles schema fixed.");
      } else {
        console.log("[migrate] battles schema OK.");
      }
    }
  }
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
