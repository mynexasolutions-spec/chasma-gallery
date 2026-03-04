const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, folder = 'ecommerce/brands') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// GET /api/brands
const getAll = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, m.file_url AS logo_url,
              (SELECT COUNT(*) FROM products WHERE brand_id = b.id) AS product_count
       FROM brands b
       LEFT JOIN media m ON b.logo_id = m.id
       ORDER BY b.name`
    );
    res.json({ success: true, brands: rows });
  } catch (err) {
    next(err);
  }
};

// GET /api/brands/:id
const getOne = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, m.file_url AS logo_url FROM brands b LEFT JOIN media m ON b.logo_id = m.id WHERE b.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, brand: rows[0] });
  } catch (err) {
    next(err);
  }
};

// POST /api/brands
const create = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' });
    }

    let logoId = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      const mediaId = uuidv4();
      await pool.query(
        'INSERT INTO media (id, file_url, file_name, mime_type, file_size) VALUES ($1,$2,$3,$4,$5)',
        [mediaId, result.secure_url, result.original_filename, req.file.mimetype, req.file.size]
      );
      logoId = mediaId;
    }

    const { rows } = await pool.query(
      `INSERT INTO brands (id, name, slug, logo_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [uuidv4(), name, slug, logoId]
    );
    res.status(201).json({ success: true, brand: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }
    next(err);
  }
};

// PUT /api/brands/:id
const update = async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    let logoId = undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      const mediaId = uuidv4();
      await pool.query(
        'INSERT INTO media (id, file_url, file_name, mime_type, file_size) VALUES ($1,$2,$3,$4,$5)',
        [mediaId, result.secure_url, result.original_filename, req.file.mimetype, req.file.size]
      );
      logoId = mediaId;
    }

    let query, params;
    if (logoId !== undefined) {
      query = `UPDATE brands SET name=$1, slug=$2, logo_id=$3 WHERE id=$4 RETURNING *`;
      params = [name, slug, logoId, req.params.id];
    } else {
      query = `UPDATE brands SET name=$1, slug=$2 WHERE id=$3 RETURNING *`;
      params = [name, slug, req.params.id];
    }

    const { rows } = await pool.query(query, params);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, brand: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Slug already exists' });
    }
    next(err);
  }
};

// DELETE /api/brands/:id
const remove = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM brands WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, message: 'Brand deleted' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ success: false, message: 'Brand is in use by products. Remove products first.' });
    }
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
