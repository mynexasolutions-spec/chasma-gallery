const pool = require('../config/db');

// GET /api/orders
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payment_status, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const params = [`%${search}%`];
    let where = 'WHERE (o.order_number ILIKE $1 OR u.email ILIKE $1)';

    if (status)         { params.push(status);         where += ` AND o.status = $${params.length}`; }
    if (payment_status) { params.push(payment_status); where += ` AND o.payment_status = $${params.length}`; }

    const { rows } = await pool.query(`
      SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method,
             o.subtotal, o.tax_amount, o.shipping_amount, o.discount_amount, o.total_amount,
             o.created_at, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${where}
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id ${where}`, params
    );

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

// GET /api/orders/:id
const getOne = async (req, res, next) => {
  try {
    const orderRes = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [req.params.id]);

    if (!orderRes.rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });

    const itemsRes = await pool.query(`
      SELECT oi.*, p.slug AS product_slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [req.params.id]);

    const paymentRes = await pool.query(
      'SELECT id, transaction_id, provider, amount, currency, status, paid_at FROM payments WHERE order_id = $1',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...orderRes.rows[0],
        items: itemsRes.rows,
        payments: paymentRes.rows,
      },
    });
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, order_number, status',
      [status, req.params.id]
    );

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/payment-status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { payment_status } = req.body;
    const allowed = ['unpaid', 'paid', 'refunded'];
    if (!allowed.includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }
    const { rows } = await pool.query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING id, order_number, payment_status',
      [payment_status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, updateStatus, updatePaymentStatus };
