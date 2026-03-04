const pool = require('../config/db');

// GET /api/reviews
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, is_approved } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
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
    `, [...params, limit, offset]);

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM reviews r ${where}`, params
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

// PATCH /api/reviews/:id/approve
const approve = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING id, is_approved',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// PATCH /api/reviews/:id/reject
const reject = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET is_approved = false WHERE id = $1 RETURNING id, is_approved',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/reviews/:id
const remove = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, approve, reject, remove };
