import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings ORDER BY key');
    const settings: Record<string, string> = rows.reduce((acc: Record<string, string>, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

export const upsert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { settings } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(settings as Record<string, string>)) {
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
