require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ecommerce_db'
  });
  await client.connect();
  const hash = await bcrypt.hash('Admin@1234', 10);
  await client.query('UPDATE users SET password_hash = $1', [hash]);
  await client.end();
  console.log('Passwords updated to Admin@1234');
})();
