import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, payment_status, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [`%${search}%`];
    let where = 'WHERE (o.order_number ILIKE $1 OR u.email ILIKE $1)';

    if (status) { params.push(status); where += ` AND o.status = $${params.length}`; }
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
    `, [...params, Number(limit), offset]);

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id ${where}`, params
    );

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
      data: { ...orderRes.rows[0], items: itemsRes.rows, payments: paymentRes.rows },
    });
  } catch (err) { next(err); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    await client.query('BEGIN');
    
    // Check current status
    const currentRes = await client.query('SELECT status FROM orders WHERE id = $1', [req.params.id]);
    if (!currentRes.rows[0]) throw { statusCode: 404, message: 'Order not found' };
    const currentStatus = currentRes.rows[0].status;
    
    // Restore stock if transitioning to cancelled/refunded
    const terminalStatuses = ['cancelled', 'refunded'];
    if (!terminalStatuses.includes(currentStatus) && terminalStatuses.includes(status)) {
      const { rows: items } = await client.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [req.params.id]);
      for (const item of items) {
        if (item.product_id) {
          await client.query(`
            UPDATE products 
            SET stock_quantity = stock_quantity + $1,
                stock_status = CASE WHEN (stock_quantity + $1) > 0 THEN 'in_stock' ELSE stock_status END
            WHERE id = $2 AND manage_stock = true
          `, [item.quantity, item.product_id]);
        }
      }
    }
    
    const { rows } = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, order_number, status',
      [status, req.params.id]
    );
    
    await client.query('COMMIT');
    res.json({ success: true, data: rows[0] });
  } catch (error: any) { 
    await client.query('ROLLBACK');
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error); 
  } finally {
    client.release();
  }
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
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

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, order_number, status, payment_status, total_amount, created_at
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user?.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const getMyOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user?.id]
    );
    if (!orderRes.rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });

    const itemsRes = await pool.query(
      `SELECT oi.*, p.slug as product_slug, m.file_url as image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
       LEFT JOIN media m ON pi.media_id = m.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...orderRes.rows[0], items: itemsRes.rows } });
  } catch (err) { next(err); }
};
