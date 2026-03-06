const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000, // 1 hour
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, role, status FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    // Never send password_hash to frontend
    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/store-login
const storeLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, role, status FROM users WHERE email = $1',
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account is blocked' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, 'customer') RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, password_hash]
    );

    const user = rows[0];

    // Auto login
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({ success: true, user });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    next(err);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, storeLogin, register, logout, me };
