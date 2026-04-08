import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Verify DB connection once at startup
pool.query(`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`)
  .then(({ rows }) => {
    console.log('✅ Connected to PostgreSQL');
    if (rows[0].count === '0') {
      console.error('❌ Table "users" not found — did you run seed.sql?');
    } else {
      console.log('✅ Database tables verified');
    }
  })
  .catch((err: Error) => console.error('❌ DB connection error:', err.message));

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL pool error:', err.message);
  process.exit(1);
});

export default pool;

