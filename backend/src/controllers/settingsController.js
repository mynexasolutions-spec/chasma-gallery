const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET /api/settings
const getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings ORDER BY key');
    // Convert to key-value object
    const settings = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// PUT /api/settings — upsert multiple
const upsert = async (req, res, next) => {
  try {
    const { settings } = req.body; // { key: value, ... }
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(settings)) {
        await client.query(`
          INSERT INTO settings (id, key, value) VALUES ($1, $2, $3)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `, [uuidv4(), key, String(value)]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ success: true, message: 'Settings saved' });
  } catch (err) { next(err); }
};

module.exports = { getAll, upsert };
