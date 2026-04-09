import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

// Razorpay is optional — only used when keys are configured
let Razorpay: any;
try { Razorpay = require('razorpay'); } catch { /* not installed */ }

const getRazorpayConfig = async () => {
  const { rows } = await pool.query("SELECT key, value FROM settings WHERE key IN ('razorpay_key_id', 'razorpay_key_secret')");
  let key_id = process.env.RAZORPAY_KEY_ID;
  let key_secret = process.env.RAZORPAY_KEY_SECRET;
  for (const r of rows) {
    if (r.key === 'razorpay_key_id' && r.value) key_id = r.value;
    if (r.key === 'razorpay_key_secret' && r.value) key_secret = r.value;
  }
  return { key_id: key_id || 'dummy_id', key_secret: key_secret || 'dummy_secret' };
};

const processOrderItems = async (client: any, frontendItems: any[]) => {
  const productIds = frontendItems.map(item => item.id);
  const { rows: products } = await client.query('SELECT id, name, price, sale_price, manage_stock, stock_quantity FROM products WHERE id = ANY($1)', [productIds]);
  let validTotal = 0;
  const validItems = [];

  for (const item of frontendItems) {
    const dbProduct = products.find((p: any) => p.id === item.id);
    if (!dbProduct) throw { statusCode: 400, message: `Product ${item.id} not found` };
    
    if (dbProduct.manage_stock && dbProduct.stock_quantity < item.quantity) {
      throw { statusCode: 400, message: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock_quantity}, Requested: ${item.quantity}` };
    }

    const unitPrice = dbProduct.sale_price ? parseFloat(dbProduct.sale_price) : parseFloat(dbProduct.price);
    const totalPrice = unitPrice * item.quantity;
    validTotal += totalPrice;
    
    validItems.push({
      id: dbProduct.id,
      name: dbProduct.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice
    });
  }
  return { validTotal, validItems };
};

const processShippingAndCoupons = async (client: any, code: string | null, subtotal: number) => {
  let discount_amount = 0;
  let coupon_id = null;
  
  // 1. Process Coupon
  if (code) {
    const { rows: coupons } = await client.query('SELECT * FROM coupons WHERE code = $1 AND is_active = true', [code.toUpperCase()]);
    const coupon = coupons[0];
    if (!coupon) throw { statusCode: 400, message: 'Invalid or inactive coupon code' };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) throw { statusCode: 400, message: 'Coupon expired' };
    
    if (coupon.usage_limit) {
      const { rows: usages } = await client.query('SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = $1', [coupon.id]);
      if (parseInt(usages[0].count) >= coupon.usage_limit) throw { statusCode: 400, message: 'Coupon usage limit reached' };
    }
    
    coupon_id = coupon.id;
    if (coupon.type === 'percentage') {
      discount_amount = parseFloat((subtotal * (parseFloat(coupon.value) / 100)).toFixed(2));
    } else {
      discount_amount = parseFloat(coupon.value);
    }
    // Prevent negative subtotal
    if (discount_amount > subtotal) discount_amount = subtotal;
  }

  // 2. Process Shipping
  const { rows: settings } = await client.query("SELECT key, value FROM settings WHERE key IN ('flat_shipping_rate', 'free_shipping_threshold')");
  let flat_shipping_rate = 0;
  let free_shipping_threshold = 0;
  
  for (const s of settings) {
    if (s.key === 'flat_shipping_rate' && s.value) flat_shipping_rate = parseFloat(s.value);
    if (s.key === 'free_shipping_threshold' && s.value) free_shipping_threshold = parseFloat(s.value);
  }

  const new_subtotal = subtotal - discount_amount;
  let shipping_amount = 0;
  if (flat_shipping_rate > 0) {
    if (free_shipping_threshold > 0 && new_subtotal >= free_shipping_threshold) {
      shipping_amount = 0;
    } else {
      shipping_amount = flat_shipping_rate;
    }
  }

  const final_total = new_subtotal + shipping_amount;
  return { coupon_id, discount_amount, shipping_amount, final_total };
};

export const getOrderSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { items = [], coupon_code = null } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    const { validTotal, validItems } = await processOrderItems(client, items);
    const { discount_amount, shipping_amount, final_total } = await processShippingAndCoupons(client, coupon_code, validTotal);

    res.json({
      success: true,
      data: {
        subtotal: validTotal,
        discount_amount,
        shipping_amount,
        total_amount: final_total,
        item_count: validItems.reduce((count, item) => count + item.quantity, 0),
      },
    });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  } finally {
    client.release();
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    if (!Razorpay) return res.status(501).json({ success: false, message: 'Razorpay SDK not installed' });
    
    await client.query('BEGIN');
    const { items, billing, coupon_code } = req.body;
    
    // Secure price calculation & stock verification
    const { validTotal, validItems } = await processOrderItems(client, items);
    
    // Apply Shipping & Coupons
    const { coupon_id, discount_amount, shipping_amount, final_total } = await processShippingAndCoupons(client, coupon_code, validTotal);
    
    const config = await getRazorpayConfig();
    const razorpay = new Razorpay(config);
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(final_total * 100), currency: 'INR',
      receipt: `rcpt_${Date.now()}`, payment_capture: 1,
    });
    if (!rzpOrder?.id) throw { statusCode: 500, message: 'Failed to create Razorpay order' };

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = req.user?.id || null;
    const result = await client.query(
      `INSERT INTO orders (user_id, order_number, status, subtotal, discount_amount, shipping_amount, total_amount, payment_status, payment_method, billing_address, shipping_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [userId, orderNumber, 'pending', validTotal, discount_amount, shipping_amount, final_total, 'unpaid', 'razorpay', JSON.stringify(billing), JSON.stringify(billing)]
    );
    const orderId = result.rows[0].id;

    await client.query(
      "INSERT INTO payments (order_id, transaction_id, provider, amount, currency, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [orderId, rzpOrder.id, 'razorpay', final_total, 'INR', 'created']
    );

    if (coupon_id) {
      await client.query('INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1,$2,$3)', [coupon_id, userId, orderId]);
    }

    for (const item of validItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5,$6)',
        [orderId, item.id, item.name, item.quantity, item.unitPrice, item.totalPrice]
      );
      
      await client.query(`
        UPDATE products 
        SET stock_quantity = GREATEST(stock_quantity - $1, 0),
            stock_status = CASE WHEN (stock_quantity - $1) <= 0 THEN 'out_of_stock' ELSE stock_status END
        WHERE id = $2 AND manage_stock = true
      `, [item.quantity, item.id]);
    }

    await client.query('COMMIT');
    res.json({ success: true, data: { id: rzpOrder.id, currency: rzpOrder.currency, amount: rzpOrder.amount, dbOrderId: orderId, rzpKey: config.key_id } });
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  } finally {
    client.release();
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const config = await getRazorpayConfig();
    const generated = crypto.createHmac('sha256', config.key_secret).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const paymentRes = await pool.query(
      `SELECT p.id, p.order_id, p.amount, p.currency, p.status, o.payment_status
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE p.transaction_id = $1 AND p.provider = 'razorpay'
       ORDER BY p.paid_at DESC NULLS LAST, p.id DESC
       LIMIT 1`,
      [razorpay_order_id]
    );

    const payment = paymentRes.rows[0];
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment order not found' });
    }

    if (payment.status === 'succeeded' || payment.payment_status === 'paid') {
      return res.status(409).json({ success: false, message: 'Payment already verified' });
    }

    await pool.query("UPDATE orders SET payment_status = 'paid', status = 'processing', payment_method = 'razorpay' WHERE id = $1", [payment.order_id]);
    await pool.query(
      "UPDATE payments SET status = $1, paid_at = NOW() WHERE id = $2",
      ['succeeded', payment.id]
    );
    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) { next(error); }
};

export const createCODOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, billing, coupon_code } = req.body;
    
    // Secure price calculation & stock verification
    const { validTotal, validItems } = await processOrderItems(client, items);

    // Apply Shipping & Coupons
    const { coupon_id, discount_amount, shipping_amount, final_total } = await processShippingAndCoupons(client, coupon_code, validTotal);
    
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = req.user?.id || null;
    const result = await client.query(
      `INSERT INTO orders (user_id, order_number, status, subtotal, discount_amount, shipping_amount, total_amount, payment_status, payment_method, billing_address, shipping_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [userId, orderNumber, 'pending', validTotal, discount_amount, shipping_amount, final_total, 'unpaid', 'cod', JSON.stringify(billing), JSON.stringify(billing)]
    );
    const orderId = result.rows[0].id;

    if (coupon_id) {
      await client.query('INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1,$2,$3)', [coupon_id, userId, orderId]);
    }
    
    for (const item of validItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5,$6)',
        [orderId, item.id, item.name, item.quantity, item.unitPrice, item.totalPrice]
      );
      
      await client.query(`
        UPDATE products 
        SET stock_quantity = GREATEST(stock_quantity - $1, 0),
            stock_status = CASE WHEN (stock_quantity - $1) <= 0 THEN 'out_of_stock' ELSE stock_status END
        WHERE id = $2 AND manage_stock = true
      `, [item.quantity, item.id]);
    }
    
    await client.query('COMMIT');
    res.json({ success: true, data: { dbOrderId: orderId, orderNumber } });
  } catch (error: any) { 
    await client.query('ROLLBACK');
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error); 
  } finally {
    client.release();
  }
};
