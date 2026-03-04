/**
 * Run this once to fix the seed password hash in Supabase.
 * Usage (from backend dir): node src/utils/fix-passwords.js
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const hash = await bcrypt.hash('Admin@1234', 12);
    console.log('Generated hash:', hash);

    const { rowCount } = await pool.query(
      'UPDATE users SET password_hash = $1',
      [hash]
    );
    console.log(`✅ Updated ${rowCount} users with correct password hash`);
    console.log('You can now login with: admin@store.com / Admin@1234');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
