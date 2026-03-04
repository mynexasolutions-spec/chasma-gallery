const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

// Helper – upload buffer to Cloudinary and return result
const uploadToCloudinary = (buffer, folder = 'ecommerce') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
};

// ── POST /api/products/:id/images  –  upload one or more images ──────────────
const uploadImages = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // Verify product exists
    const prodRes = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (!prodRes.rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    // Check if product already has images (to decide is_primary)
    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM product_images WHERE product_id = $1', [productId]
    );
    let existingCount = countRes.rows[0].cnt;

    const uploaded = [];

    for (const file of req.files) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.buffer, 'ecommerce/products');

      // Save to media table
      const mediaId = uuidv4();
      await pool.query(
        `INSERT INTO media (id, file_url, file_name, mime_type, file_size, alt_text)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [mediaId, result.secure_url, result.original_filename, file.mimetype, file.size, file.originalname]
      );

      // Link to product_images
      const piId = uuidv4();
      const isPrimary = existingCount === 0; // first image is primary
      const displayOrder = existingCount;

      await pool.query(
        `INSERT INTO product_images (id, product_id, media_id, is_primary, display_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [piId, productId, mediaId, isPrimary, displayOrder]
      );

      existingCount++;

      uploaded.push({
        id: piId,
        media_id: mediaId,
        file_url: result.secure_url,
        is_primary: isPrimary,
        display_order: displayOrder,
      });
    }

    res.status(201).json({ success: true, data: uploaded });
  } catch (err) { next(err); }
};

// ── GET /api/products/:id/images  –  list images for a product ───────────────
const getImages = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT pi.id, pi.media_id, pi.is_primary, pi.display_order,
             m.file_url, m.file_name, m.alt_text
      FROM product_images pi
      JOIN media m ON pi.media_id = m.id
      WHERE pi.product_id = $1
      ORDER BY pi.display_order
    `, [req.params.id]);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── PUT /api/products/:id/images/:imageId/primary  –  set as primary ─────────
const setPrimary = async (req, res, next) => {
  try {
    const { id: productId, imageId } = req.params;
    // Un-set all
    await pool.query(
      'UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]
    );
    // Set target
    const { rowCount } = await pool.query(
      'UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2', [imageId, productId]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, message: 'Primary image updated' });
  } catch (err) { next(err); }
};

// ── DELETE /api/products/:id/images/:imageId  –  remove image ────────────────
const removeImage = async (req, res, next) => {
  try {
    const { id: productId, imageId } = req.params;

    // Get media info to delete from Cloudinary
    const imgRes = await pool.query(`
      SELECT pi.id, m.file_url, m.id AS media_id
      FROM product_images pi JOIN media m ON pi.media_id = m.id
      WHERE pi.id = $1 AND pi.product_id = $2
    `, [imageId, productId]);

    if (!imgRes.rows[0]) return res.status(404).json({ success: false, message: 'Image not found' });

    const { file_url, media_id } = imgRes.rows[0];

    // Extract public_id from URL for Cloudinary deletion
    try {
      const parts = file_url.split('/upload/');
      if (parts[1]) {
        const publicId = parts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      }
    } catch { /* ignore Cloudinary errors on delete */ }

    // Remove records
    await pool.query('DELETE FROM product_images WHERE id = $1', [imageId]);
    await pool.query('DELETE FROM media WHERE id = $1', [media_id]);

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) { next(err); }
};

// ── Product Variations ────────────────────────────────────────────────────────

// GET /api/products/:id/variations
const getVariations = async (req, res, next) => {
  try {
    const { rows: variations } = await pool.query(`
      SELECT pv.id, pv.sku, pv.price, pv.sale_price, pv.stock_quantity, pv.created_at
      FROM product_variations pv
      WHERE pv.product_id = $1
      ORDER BY pv.created_at
    `, [req.params.id]);

    // Fetch attribute values for each variation
    for (const v of variations) {
      const { rows: attrs } = await pool.query(`
        SELECT vav.id AS vav_id, av.id AS attribute_value_id, av.value, a.name AS attribute_name, a.id AS attribute_id
        FROM variation_attribute_values vav
        JOIN attribute_values av ON vav.attribute_value_id = av.id
        JOIN attributes a ON av.attribute_id = a.id
        WHERE vav.variation_id = $1
        ORDER BY a.name
      `, [v.id]);
      v.attributes = attrs;
    }

    res.json({ success: true, data: variations });
  } catch (err) { next(err); }
};

// POST /api/products/:id/variations
const createVariation = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { sku, price, sale_price, stock_quantity, attribute_value_ids } = req.body;

    const id = uuidv4();
    const { rows } = await pool.query(`
      INSERT INTO product_variations (id, product_id, sku, price, sale_price, stock_quantity)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [id, productId, sku, price, sale_price || null, stock_quantity || 0]);

    // Link attribute values
    if (attribute_value_ids && attribute_value_ids.length > 0) {
      for (const avId of attribute_value_ids) {
        const vavId = uuidv4();
        await pool.query(
          'INSERT INTO variation_attribute_values (id, variation_id, attribute_value_id) VALUES ($1, $2, $3)',
          [vavId, id, avId]
        );
      }
    }

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'SKU already exists' });
    next(err);
  }
};

// PUT /api/products/:id/variations/:varId
const updateVariation = async (req, res, next) => {
  try {
    const { varId } = req.params;
    const { sku, price, sale_price, stock_quantity, attribute_value_ids } = req.body;

    const { rows } = await pool.query(`
      UPDATE product_variations SET sku=$1, price=$2, sale_price=$3, stock_quantity=$4
      WHERE id=$5 RETURNING *
    `, [sku, price, sale_price || null, stock_quantity || 0, varId]);

    if (!rows[0]) return res.status(404).json({ success: false, message: 'Variation not found' });

    // Re-link attribute values
    if (attribute_value_ids) {
      await pool.query('DELETE FROM variation_attribute_values WHERE variation_id = $1', [varId]);
      for (const avId of attribute_value_ids) {
        const vavId = uuidv4();
        await pool.query(
          'INSERT INTO variation_attribute_values (id, variation_id, attribute_value_id) VALUES ($1, $2, $3)',
          [vavId, varId, avId]
        );
      }
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'SKU already exists' });
    next(err);
  }
};

// DELETE /api/products/:id/variations/:varId
const deleteVariation = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM product_variations WHERE id = $1 AND product_id = $2',
      [req.params.varId, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Variation not found' });
    res.json({ success: true, message: 'Variation deleted' });
  } catch (err) { next(err); }
};

module.exports = {
  uploadImages, getImages, setPrimary, removeImage,
  getVariations, createVariation, updateVariation, deleteVariation,
};
