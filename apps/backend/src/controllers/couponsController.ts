import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, COUNT(cu.id) AS usage_count
      FROM coupons c
      LEFT JOIN coupon_usages cu ON c.id = cu.coupon_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, type, value, usage_limit, expires_at, is_active } = req.body;
    const id = uuidv4();
    const { rows } = await pool.query(`
      INSERT INTO coupons (id, code, type, value, usage_limit, expires_at, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [id, code.toUpperCase(), type, value, usage_limit || null, expires_at || null, is_active ?? true]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, type, value, usage_limit, expires_at, is_active } = req.body;
    const { rows } = await pool.query(`
      UPDATE coupons SET code=$1, type=$2, value=$3, usage_limit=$4, expires_at=$5, is_active=$6
      WHERE id=$7 RETURNING *
    `, [code.toUpperCase(), type, value, usage_limit || null, expires_at || null, is_active, req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM coupons WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};
