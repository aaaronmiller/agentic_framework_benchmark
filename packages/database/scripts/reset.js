import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function reset() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Dropping all tables...');

    await client.query(`
      DROP TABLE IF EXISTS methodology_proposals CASCADE;
      DROP TABLE IF EXISTS usage_statistics CASCADE;
      DROP TABLE IF EXISTS benchmark_results CASCADE;
      DROP TABLE IF EXISTS config_files CASCADE;
      DROP TABLE IF EXISTS characteristics CASCADE;
      DROP TABLE IF EXISTS scores CASCADE;
      DROP TABLE IF EXISTS frameworks CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    `);

    console.log('✅ Database reset completed!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

reset();
