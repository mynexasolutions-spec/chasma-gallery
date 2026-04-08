import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@ecommerce/shared-types';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, search = '', status, category_id, brand_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [`%${search}%`];
    let where = 'WHERE (p.name ILIKE $1 OR p.sku ILIKE $1)';

    if (status === 'active')   { where += ` AND p.is_active = true`;  }
    if (status === 'inactive') { where += ` AND p.is_active = false`; }
    if (category_id) { params.push(category_id); where += ` AND p.category_id = $${params.length}`; }
    if (brand_id)    { params.push(brand_id);    where += ` AND p.brand_id = $${params.length}`; }

    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.sku, p.type, p.price, p.sale_price,
             p.stock_quantity, p.stock_status, p.is_active, p.is_featured,
             p.created_at, c.name AS category_name, b.name AS brand_name,
             m.file_url AS image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      LEFT JOIN media m ON pi.media_id = m.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [...params, Number(limit), offset]);

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p ${where}`, params
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: parseInt(countRes.rows[0].count),
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(countRes.rows[0].count / Number(limit)),
      },
    });
  } catch (err) { next(err); }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, c.name AS category_name, b.name AS brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, slug, sku, type, description, short_description,
      price, sale_price, stock_quantity, stock_status, manage_stock,
      category_id, brand_id, is_featured, is_active
    }: Partial<Product> = req.body;

    const id = uuidv4();
    const { rows } = await pool.query(`
      INSERT INTO products (id, name, slug, sku, type, description, short_description,
        price, sale_price, stock_quantity, stock_status, manage_stock,
        category_id, brand_id, is_featured, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [id, name, slug, sku, type, description, short_description,
        price, sale_price || null, stock_quantity, stock_status,
        manage_stock, category_id || null, brand_id || null, is_featured, is_active]);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A product with this slug or SKU already exists' });
    }
    next(err); 
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, slug, sku, type, description, short_description,
      price, sale_price, stock_quantity, stock_status, manage_stock,
      category_id, brand_id, is_featured, is_active
    }: Partial<Product> = req.body;

    const { rows } = await pool.query(`
      UPDATE products SET
        name=$1, slug=$2, sku=$3, type=$4, description=$5, short_description=$6,
        price=$7, sale_price=$8, stock_quantity=$9, stock_status=$10, manage_stock=$11,
        category_id=$12, brand_id=$13, is_featured=$14, is_active=$15, updated_at=NOW()
      WHERE id=$16 RETURNING *
    `, [name, slug, sku, type, description, short_description,
        price, sale_price || null, stock_quantity, stock_status, manage_stock,
        category_id || null, brand_id || null, is_featured, is_active, req.params.id]);

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A product with this slug or SKU already exists' });
    }
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    if (err.code === '23503') {
      return res.status(409).json({ success: false, message: 'Product cannot be deleted because it is associated with past orders. Please deactivate it instead.' });
    }
    next(err);
  }
};
