import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, is_approved } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    let where = '';

    if (is_approved !== undefined) {
      params.push(is_approved === 'true');
      where = `WHERE r.is_approved = $${params.length}`;
    }

    const { rows } = await pool.query(`
      SELECT r.id, r.rating, r.title, r.comment, r.is_approved, r.created_at,
             u.first_name, u.last_name, u.email,
             p.name AS product_name, p.id AS product_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      ${where}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, Number(limit), offset]);

    const countRes = await pool.query(`SELECT COUNT(*) FROM reviews r ${where}`, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: parseInt(countRes.rows[0].count),
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(countRes.rows[0].count / Number(limit)),
      },
    });
  } catch (err) { next(err); }
};

export const approve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query('UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING id, is_approved', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query('UPDATE reviews SET is_approved = false WHERE id = $1 RETURNING id, is_approved', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};
