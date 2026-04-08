import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

export const getFeatured = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.short_description,
             p.stock_status, c.name AS category_name, b.name AS brand_name,
             m.file_url AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN media m ON pi.media_id = m.id
      WHERE p.is_active = true AND p.is_featured = true
      ORDER BY p.created_at DESC LIMIT 8
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const getNewArrivals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.short_description,
             p.stock_status, c.name AS category_name, b.name AS brand_name,
             m.file_url AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN media m ON pi.media_id = m.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC LIMIT 8
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.slug, c.description, c.parent_id,
             m.file_url AS image_url,
             (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = true) AS product_count
      FROM categories c
      LEFT JOIN media m ON c.image_id = m.id
      ORDER BY c.name
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.id, b.name, b.slug, m.file_url AS logo_url,
             (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND is_active = true) AS product_count
      FROM brands b
      LEFT JOIN media m ON b.logo_id = m.id
      ORDER BY b.name
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, search = '', category, brand, min_price, max_price, stock_status, sort = 'newest' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [`%${search}%`];
    let where = `WHERE p.is_active = true AND (p.name ILIKE $1 OR p.short_description ILIKE $1)`;

    if (category) { params.push(category); where += ` AND p.category_id = $${params.length}`; }
    if (brand) { params.push(brand); where += ` AND p.brand_id = $${params.length}`; }
    if (min_price) { params.push(min_price); where += ` AND COALESCE(p.sale_price, p.price) >= $${params.length}`; }
    if (max_price) { params.push(max_price); where += ` AND COALESCE(p.sale_price, p.price) <= $${params.length}`; }
    if (stock_status) { params.push(stock_status); where += ` AND p.stock_status = $${params.length}`; }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'COALESCE(p.sale_price, p.price) ASC';
    if (sort === 'price_desc') orderBy = 'COALESCE(p.sale_price, p.price) DESC';
    if (sort === 'name_asc') orderBy = 'p.name ASC';
    if (sort === 'name_desc') orderBy = 'p.name DESC';
    if (sort === 'featured') orderBy = 'p.is_featured DESC, p.created_at DESC';

    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.slug, p.price, p.sale_price, p.short_description,
             p.stock_status, p.is_featured,
             c.name AS category_name, b.name AS brand_name,
             m.file_url AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN media m ON pi.media_id = m.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, Number(limit), offset]);

    const countRes = await pool.query(`SELECT COUNT(*) FROM products p ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    const rangeRes = await pool.query(`
      SELECT MIN(COALESCE(p.sale_price, p.price))::numeric AS min_price,
             MAX(COALESCE(p.sale_price, p.price))::numeric AS max_price
      FROM products p WHERE p.is_active = true
    `);

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      priceRange: rangeRes.rows[0],
    });
  } catch (err) { next(err); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.name AS category_name, b.name AS brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1 AND p.is_active = true
    `, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });

    const imgRes = await pool.query(`
      SELECT pi.id, m.file_url, m.alt_text, pi.is_primary, pi.display_order
      FROM product_images pi JOIN media m ON pi.media_id = m.id
      WHERE pi.product_id = $1 ORDER BY pi.display_order
    `, [req.params.id]);

    const revRes = await pool.query(`
      SELECT r.id, r.rating, r.title, r.comment, r.created_at,
             u.first_name, u.last_name
      FROM reviews r JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC LIMIT 20
    `, [req.params.id]);

    const avgRes = await pool.query(`
      SELECT ROUND(AVG(rating), 1) AS avg_rating, COUNT(*)::int AS review_count
      FROM reviews WHERE product_id = $1 AND is_approved = true
    `, [req.params.id]);

    const varRes = await pool.query(`
      SELECT pv.id, pv.sku, pv.price, pv.sale_price, pv.stock_quantity
      FROM product_variations pv WHERE pv.product_id = $1
    `, [req.params.id]);

    for (const v of varRes.rows) {
      const { rows: attrs } = await pool.query(`
        SELECT av.value, a.name AS attribute_name
        FROM variation_attribute_values vav
        JOIN attribute_values av ON vav.attribute_value_id = av.id
        JOIN attributes a ON av.attribute_id = a.id
        WHERE vav.variation_id = $1
      `, [v.id]);
      v.attributes = attrs;
    }

    res.json({
      success: true,
      data: {
        ...rows[0],
        images: imgRes.rows,
        reviews: revRes.rows,
        avg_rating: parseFloat(avgRes.rows[0].avg_rating) || 0,
        review_count: avgRes.rows[0].review_count,
        variations: varRes.rows,
      },
    });
  } catch (err) { next(err); }
};
