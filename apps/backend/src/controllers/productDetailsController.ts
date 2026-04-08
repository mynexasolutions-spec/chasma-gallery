import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import cloudinary from '../config/cloudinary';
import { v4 as uuidv4 } from 'uuid';

const uploadToCloudinary = (buffer: Buffer, folder = 'ecommerce'): Promise<any> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// ── Images ──────────────────────────────────────────────────────────

export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const prodRes = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (!prodRes.rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No images provided' });

    const countRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM product_images WHERE product_id = $1', [productId]);
    let existingCount = countRes.rows[0].cnt;
    const uploaded = [];

    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, 'ecommerce/products');
      const mediaId = uuidv4();
      await pool.query(
        'INSERT INTO media (id, file_url, file_name, mime_type, file_size, alt_text) VALUES ($1,$2,$3,$4,$5,$6)',
        [mediaId, result.secure_url, result.original_filename, file.mimetype, file.size, file.originalname]
      );
      const piId = uuidv4();
      const isPrimary = existingCount === 0;
      await pool.query(
        'INSERT INTO product_images (id, product_id, media_id, is_primary, display_order) VALUES ($1,$2,$3,$4,$5)',
        [piId, productId, mediaId, isPrimary, existingCount]
      );
      existingCount++;
      uploaded.push({ id: piId, media_id: mediaId, file_url: result.secure_url, is_primary: isPrimary, display_order: existingCount - 1 });
    }
    res.status(201).json({ success: true, data: uploaded });
  } catch (err) { next(err); }
};

export const getImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(`
      SELECT pi.id, pi.media_id, pi.is_primary, pi.display_order, m.file_url, m.file_name, m.alt_text
      FROM product_images pi JOIN media m ON pi.media_id = m.id
      WHERE pi.product_id = $1 ORDER BY pi.display_order
    `, [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

export const setPrimary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: productId, imageId } = req.params;
    await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]);
    const { rowCount } = await pool.query('UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2', [imageId, productId]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, message: 'Primary image updated' });
  } catch (err) { next(err); }
};

export const removeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: productId, imageId } = req.params;
    const imgRes = await pool.query(`
      SELECT pi.id, m.file_url, m.id AS media_id
      FROM product_images pi JOIN media m ON pi.media_id = m.id
      WHERE pi.id = $1 AND pi.product_id = $2
    `, [imageId, productId]);
    if (!imgRes.rows[0]) return res.status(404).json({ success: false, message: 'Image not found' });

    const { file_url, media_id } = imgRes.rows[0];
    try {
      const parts = file_url.split('/upload/');
      if (parts[1]) {
        const publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      }
    } catch { /* ignore */ }

    await pool.query('DELETE FROM product_images WHERE id = $1', [imageId]);
    await pool.query('DELETE FROM media WHERE id = $1', [media_id]);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) { next(err); }
};

// ── Variations ──────────────────────────────────────────────────────

export const getVariations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows: variations } = await pool.query(`
      SELECT pv.id, pv.sku, pv.price, pv.sale_price, pv.stock_quantity, pv.created_at
      FROM product_variations pv WHERE pv.product_id = $1 ORDER BY pv.created_at
    `, [req.params.id]);

    for (const v of variations) {
      const { rows: attrs } = await pool.query(`
        SELECT vav.id AS vav_id, av.id AS attribute_value_id, av.value, a.name AS attribute_name, a.id AS attribute_id
        FROM variation_attribute_values vav
        JOIN attribute_values av ON vav.attribute_value_id = av.id
        JOIN attributes a ON av.attribute_id = a.id
        WHERE vav.variation_id = $1 ORDER BY a.name
      `, [v.id]);
      v.attributes = attrs;
    }
    res.json({ success: true, data: variations });
  } catch (err) { next(err); }
};

export const createVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    const { sku, price, sale_price, stock_quantity, attribute_value_ids } = req.body;
    const id = uuidv4();
    const { rows } = await pool.query(`
      INSERT INTO product_variations (id, product_id, sku, price, sale_price, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id, productId, sku, price, sale_price || null, stock_quantity || 0]);

    if (attribute_value_ids?.length) {
      for (const avId of attribute_value_ids) {
        await pool.query('INSERT INTO variation_attribute_values (id, variation_id, attribute_value_id) VALUES ($1, $2, $3)', [uuidv4(), id, avId]);
      }
    }
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'SKU already exists' });
    next(err);
  }
};

export const updateVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { varId } = req.params;
    const { sku, price, sale_price, stock_quantity, attribute_value_ids } = req.body;
    const { rows } = await pool.query(`
      UPDATE product_variations SET sku=$1, price=$2, sale_price=$3, stock_quantity=$4 WHERE id=$5 RETURNING *
    `, [sku, price, sale_price || null, stock_quantity || 0, varId]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Variation not found' });

    if (attribute_value_ids) {
      await pool.query('DELETE FROM variation_attribute_values WHERE variation_id = $1', [varId]);
      for (const avId of attribute_value_ids) {
        await pool.query('INSERT INTO variation_attribute_values (id, variation_id, attribute_value_id) VALUES ($1, $2, $3)', [uuidv4(), varId, avId]);
      }
    }
    res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'SKU already exists' });
    next(err);
  }
};

export const deleteVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM product_variations WHERE id = $1 AND product_id = $2', [req.params.varId, req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Variation not found' });
    res.json({ success: true, message: 'Variation deleted' });
  } catch (err) { next(err); }
};
