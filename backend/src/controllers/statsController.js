const pool = require('../config/db');

// GET /api/stats/overview
const overview = async (req, res, next) => {
  try {
    const [
      usersRes, ordersRes, revenueRes, productsRes,
      pendingOrdersRes, lowStockRes, recentOrdersRes, topProductsRes
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`),
      pool.query(`SELECT COUNT(*) FROM orders`),
      pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE payment_status = 'paid'`),
      pool.query(`SELECT COUNT(*) FROM products WHERE is_active = true`),
      pool.query(`SELECT COUNT(*) FROM orders WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM products WHERE stock_quantity <= 5 AND is_active = true`),
      pool.query(`
        SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_status, o.created_at,
               u.first_name, u.last_name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
      pool.query(`
        SELECT p.id, p.name, p.price, p.stock_quantity,
               COUNT(oi.id) AS total_orders,
               COALESCE(SUM(oi.total_price), 0) AS revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY revenue DESC LIMIT 5
      `),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total_customers: parseInt(usersRes.rows[0].count),
          total_orders:    parseInt(ordersRes.rows[0].count),
          total_revenue:   parseFloat(revenueRes.rows[0].total),
          active_products: parseInt(productsRes.rows[0].count),
          pending_orders:  parseInt(pendingOrdersRes.rows[0].count),
          low_stock:       parseInt(lowStockRes.rows[0].count),
        },
        recent_orders: recentOrdersRes.rows,
        top_products:  topProductsRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/stats/revenue-chart
const revenueChart = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const { rows } = await pool.query(`
      SELECT DATE(created_at) AS date,
             COALESCE(SUM(total_amount), 0)::float AS revenue,
             COUNT(*)::int AS orders
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [days]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/stats/sales-by-category
const salesByCategory = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.name AS category,
             COUNT(DISTINCT oi.order_id)::int AS order_count,
             COALESCE(SUM(oi.total_price), 0)::float AS revenue
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/stats/top-customers
const topCustomers = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email,
             COUNT(o.id)::int AS order_count,
             COALESCE(SUM(o.total_amount), 0)::float AS total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.payment_status = 'paid'
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 10
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { overview, revenueChart, salesByCategory, topCustomers };
