const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// GET /api/users
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [`%${search}%`];
    let where = 'WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)';

    if (role)   { params.push(role);   where += ` AND role = $${params.length}`; }
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }

    const { rows } = await pool.query(`
      SELECT id, first_name, last_name, email, role, status, created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: parseInt(countRes.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countRes.rows[0].count / limit),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/users/:id
const getOne = async (req, res, next) => {
  try {
    const userRes = await pool.query(
      'SELECT id, first_name, last_name, email, role, status, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (!userRes.rows[0]) return res.status(404).json({ success: false, message: 'User not found' });

    const addressRes = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1',
      [req.params.id]
    );

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

// POST /api/users
const create = async (req, res, next) => {
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
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    next(err);
  }
};

// PATCH /api/users/:id/status
const updateStatus = async (req, res, next) => {
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

// PUT /api/users/:id
const update = async (req, res, next) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, email=$3, role=$4, updated_at=NOW()
       WHERE id=$5 RETURNING id, first_name, last_name, email, role, status, created_at`,
      [first_name, last_name, email, role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    next(err);
  }
};

// DELETE /api/users/:id
const remove = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, updateStatus, remove };
