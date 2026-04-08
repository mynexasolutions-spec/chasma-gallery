import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// ── Attributes ────────────────────────────────────────────────────

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.id, a.name, a.slug,
             COUNT(av.id)::int AS value_count
      FROM attributes a
      LEFT JOIN attribute_values av ON a.id = av.attribute_id
      GROUP BY a.id
      ORDER BY a.name
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attrRes = await pool.query('SELECT * FROM attributes WHERE id = $1', [req.params.id]);
    if (!attrRes.rows[0]) return res.status(404).json({ success: false, message: 'Attribute not found' });
    const valuesRes = await pool.query('SELECT id, value FROM attribute_values WHERE attribute_id = $1 ORDER BY value', [req.params.id]);
    res.json({ success: true, data: { ...attrRes.rows[0], values: valuesRes.rows } });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const id = uuidv4();
    const { rows } = await pool.query('INSERT INTO attributes (id, name, slug) VALUES ($1, $2, $3) RETURNING *', [id, name, slug]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Slug already exists' });
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const { rows } = await pool.query('UPDATE attributes SET name = $1, slug = $2 WHERE id = $3 RETURNING *', [name, slug, req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Attribute not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Slug already exists' });
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM attributes WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Attribute not found' });
    res.json({ success: true, message: 'Attribute deleted' });
  } catch (err: any) {
    if (err.code === '23503') return res.status(409).json({ success: false, message: 'Attribute is in use by variations' });
    next(err);
  }
};

// ── Attribute Values ──────────────────────────────────────────────

export const getValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query('SELECT id, value FROM attribute_values WHERE attribute_id = $1 ORDER BY value', [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const addValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value } = req.body;
    const id = uuidv4();
    const { rows } = await pool.query('INSERT INTO attribute_values (id, attribute_id, value) VALUES ($1, $2, $3) RETURNING *', [id, req.params.id, value]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const updateValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value } = req.body;
    const { rows } = await pool.query('UPDATE attribute_values SET value = $1 WHERE id = $2 AND attribute_id = $3 RETURNING *', [value, req.params.valueId, req.params.attrId]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Value not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const removeValue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM attribute_values WHERE id = $1 AND attribute_id = $2', [req.params.valueId, req.params.attrId]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Value not found' });
    res.json({ success: true, message: 'Value deleted' });
  } catch (err: any) {
    if (err.code === '23503') return res.status(409).json({ success: false, message: 'Value in use by variations' });
    next(err);
  }
};
