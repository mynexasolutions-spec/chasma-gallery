const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

// Verify tables exist on startup
pool.query(`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'`)
  .then(({ rows }) => {
    if (rows[0].count === '0') {
      console.error('❌ Table "users" not found in public schema — did you run seed.sql in Supabase?');
    } else {
      console.log('✅ Database tables verified');
    }
  })
  .catch(err => console.error('❌ DB verification error:', err.message));

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
  process.exit(1);
});

module.exports = pool;
