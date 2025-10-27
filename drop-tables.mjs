import { drizzle } from 'drizzle-orm/mysql2';

const db = drizzle(process.env.DATABASE_URL);

try {
  await db.execute('DROP TABLE IF EXISTS battleParticipants');
  await db.execute('DROP TABLE IF EXISTS battles');
  await db.execute('DROP TABLE IF EXISTS crusadeUnits');
  await db.execute('DROP TABLE IF EXISTS players');
  await db.execute('DROP TABLE IF EXISTS campaigns');
  console.log('Tables dropped successfully');
} catch (e) {
  console.error('Error:', e.message);
}

process.exit(0);

