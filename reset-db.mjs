import { drizzle } from 'drizzle-orm/mysql2';

const db = drizzle(process.env.DATABASE_URL);

try {
  console.log('Dropping all tables...');
  await db.execute('DROP TABLE IF EXISTS battleParticipants');
  await db.execute('DROP TABLE IF EXISTS battles');
  await db.execute('DROP TABLE IF EXISTS crusadeUnits');
  await db.execute('DROP TABLE IF EXISTS players');
  await db.execute('DROP TABLE IF EXISTS campaigns');
  console.log('Tables dropped successfully');
  
  console.log('Creating tables from migration...');
  const fs = await import('fs');
  const sql = fs.readFileSync('./drizzle/0000_typical_justice.sql', 'utf-8');
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
  
  for (const statement of statements) {
    if (statement && !statement.includes('CREATE TABLE `users`')) {
      await db.execute(statement);
    }
  }
  
  console.log('Tables created successfully!');
} catch (e) {
  console.error('Error:', e.message);
}

process.exit(0);

