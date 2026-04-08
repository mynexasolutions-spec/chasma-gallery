import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';
import cloudinary from '../config/cloudinary';

const uploadToCloudinary = (buffer: Buffer, folder = 'ecommerce/categories'): Promise<any> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// GET /api/categories
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, p.name AS parent_name, m.file_url AS image_url,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       LEFT JOIN media m ON c.image_id = m.id
       ORDER BY c.name`
    );
    res.json({ success: true, categories: rows });
  } catch (err) { next(err); }
};

// GET /api/categories/:id
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, p.name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category: rows[0] });
  } catch (err) { next(err); }
};

// POST /api/categories
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, parent_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' });
    }

    let imageId: string | null = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      const mediaId = uuidv4();
      await pool.query(
        'INSERT INTO media (id, file_url, file_name, mime_type, file_size) VALUES ($1,$2,$3,$4,$5)',
        [mediaId, result.secure_url, result.original_filename, req.file.mimetype, req.file.size]
      );
      imageId = mediaId;
    }

    const { rows } = await pool.query(
      `INSERT INTO categories (id, name, slug, description, parent_id, image_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uuidv4(), name, slug, description || null, parent_id || null, imageId]
    );
    res.status(201).json({ success: true, category: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }
    next(err);
  }
};

// PUT /api/categories/:id
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, parent_id } = req.body;

    let imageId: string | undefined = undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      const mediaId = uuidv4();
      await pool.query(
        'INSERT INTO media (id, file_url, file_name, mime_type, file_size) VALUES ($1,$2,$3,$4,$5)',
        [mediaId, result.secure_url, result.original_filename, req.file.mimetype, req.file.size]
      );
      imageId = mediaId;
    }

    let query: string, params: any[];
    if (imageId !== undefined) {
      query = `UPDATE categories SET name=$1, slug=$2, description=$3, parent_id=$4, image_id=$5, updated_at=NOW()
               WHERE id=$6 RETURNING *`;
      params = [name, slug, description || null, parent_id || null, imageId, req.params.id];
    } else {
      query = `UPDATE categories SET name=$1, slug=$2, description=$3, parent_id=$4, updated_at=NOW()
               WHERE id=$5 RETURNING *`;
      params = [name, slug, description || null, parent_id || null, req.params.id];
    }

    const { rows } = await pool.query(query, params);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }
    next(err);
  }
};

// DELETE /api/categories/:id
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    if (err.code === '23503') {
      return res.status(409).json({ success: false, message: 'Category is in use by products. Remove products first.' });
    }
    next(err);
  }
};
