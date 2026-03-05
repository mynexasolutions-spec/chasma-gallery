const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');

// Add error handling if razorpay keys aren't set
const getRazorpayConfig = async () => {
    const { rows } = await pool.query("SELECT key, value FROM settings WHERE key IN ('razorpay_key_id', 'razorpay_key_secret')");
    let key_id = process.env.RAZORPAY_KEY_ID;
    let key_secret = process.env.RAZORPAY_KEY_SECRET;

    for (const r of rows) {
        if (r.key === 'razorpay_key_id' && r.value) key_id = r.value;
        if (r.key === 'razorpay_key_secret' && r.value) key_secret = r.value;
    }

    return {
        key_id: key_id || 'dummy_id',
        key_secret: key_secret || 'dummy_secret'
    };
};

const createOrder = async (req, res, next) => {
    try {
        const { items, billing, total } = req.body;

        // Create razorpay order
        const options = {
            amount: Math.round(total * 100), // amount in smallest currency unit 
            currency: "INR", // Changed to INR
            receipt: `rcpt_${Date.now()}`,
            payment_capture: 1 // AUTO CAPTURE AS INSTRUCTED!
        };

        const config = await getRazorpayConfig();
        const razorpay = new Razorpay(config);
        const rzpOrder = await razorpay.orders.create(options);

        // Fallback if Razorpay API fails for any reason
        if (!rzpOrder || !rzpOrder.id) {
            return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
        }

        // Create DB order
        const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const result = await pool.query(
            `INSERT INTO orders 
        (order_number, status, subtotal, total_amount, payment_status, payment_method, billing_address) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [orderNumber, 'pending', total, total, 'unpaid', 'razorpay', JSON.stringify(billing)]
        );
        const orderId = result.rows[0].id;

        // Insert items
        for (const item of items) {
            const price = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price);
            await pool.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, item.id, item.name, item.quantity, price, price * item.quantity]
            );
        }

        res.json({
            success: true,
            data: {
                id: rzpOrder.id,
                currency: rzpOrder.currency,
                amount: rzpOrder.amount,
                dbOrderId: orderId,
                rzpKey: config.key_id // Return the dynamic key to the frontend
            }
        });

    } catch (error) {
        if (error.statusCode === 401) {
            return res.status(401).json({ success: false, message: 'Razorpay keys are missing or invalid' });
        }
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId, amount } = req.body;

        const config = await getRazorpayConfig();
        const secret = config.key_secret;

        const generated_signature = crypto.createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // update order
            await pool.query(
                `UPDATE orders SET payment_status = 'paid', status = 'processing', payment_method = 'razorpay' WHERE id = $1`,
                [dbOrderId]
            );

            // insert payment record
            await pool.query(
                `INSERT INTO payments (order_id, transaction_id, provider, amount, currency, status, paid_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [dbOrderId, razorpay_payment_id, 'razorpay', amount, 'INR', 'succeeded']
            );

            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid Signature" });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, verifyPayment };
