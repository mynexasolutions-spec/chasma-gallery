import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search = '', role, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [`%${search}%`];
    let where = 'WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)';

    if (role)   { params.push(role);   where += ` AND role = $${params.length}`; }
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }

    const { rows } = await pool.query(`
      SELECT id, first_name, last_name, email, role, status, created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, Number(limit), offset]);

    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);

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

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRes = await pool.query(
      'SELECT id, first_name, last_name, email, role, status, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!userRes.rows[0]) return res.status(404).json({ success: false, message: 'User not found' });

    const addressRes = await pool.query('SELECT * FROM user_addresses WHERE user_id = $1', [req.params.id]);
    const ordersRes = await pool.query(
      'SELECT id, order_number, status, total_amount, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...userRes.rows[0], addresses: addressRes.rows, recent_orders: ordersRes.rows },
    });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, password, role = 'customer' } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const { rows } = await pool.query(`
      INSERT INTO users (id, first_name, last_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING id, first_name, last_name, email, role, status, created_at
    `, [id, first_name, last_name, email, hash, role]);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, email=$3, role=$4, updated_at=NOW()
       WHERE id=$5 RETURNING id, first_name, last_name, email, role, status, created_at`,
      [first_name, last_name, email, role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const { rows } = await pool.query(
      `UPDATE users SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, first_name, last_name, email, role, status`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};
