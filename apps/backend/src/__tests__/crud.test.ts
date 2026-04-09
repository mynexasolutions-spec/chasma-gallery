import crypto from 'crypto';
import request from 'supertest';
import app from '../app';
import pool from '../config/db';

async function adminCookie(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@store.com', password: 'Admin@1234' });
  return res.headers['set-cookie'] as string;
}

describe('Orders API', () => {
  let cookie: string;
  let guestOrderId: string;
  let guestOrderNumber: string;

  beforeAll(async () => {
    cookie = await adminCookie();

    guestOrderNumber = `ORD-GUEST-${Date.now()}`;
    const insertRes = await pool.query(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, tax_amount, shipping_amount,
        discount_amount, total_amount, payment_status, payment_method, billing_address, shipping_address
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        null,
        guestOrderNumber,
        'pending',
        100,
        0,
        0,
        0,
        100,
        'unpaid',
        'cod',
        JSON.stringify({ name: 'Guest Customer', email: 'guest@test.com' }),
        JSON.stringify({ name: 'Guest Customer', email: 'guest@test.com' }),
      ]
    );
    guestOrderId = insertRes.rows[0].id;
  });

  it('GET /api/orders returns paginated list', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET /api/orders requires auth', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('GET /api/orders includes guest checkouts', async () => {
    const res = await request(app)
      .get('/api/orders')
      .query({ search: guestOrderNumber })
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((order: any) => order.id === guestOrderId)).toBe(true);
  });

  it('GET /api/orders/:id returns guest checkout details', async () => {
    const res = await request(app)
      .get(`/api/orders/${guestOrderId}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(guestOrderId);
    expect(res.body.data.email).toBe('guest@test.com');
    expect(res.body.data.first_name).toBe('Guest Customer');
  });

  it('PATCH /api/orders/:id/status rejects invalid status', async () => {
    const res = await request(app)
      .patch('/api/orders/00000000-0000-0000-0000-000000000000/status')
      .set('Cookie', cookie)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('PATCH /api/orders/:id/payment-status rejects invalid payment status', async () => {
    const res = await request(app)
      .patch('/api/orders/00000000-0000-0000-0000-000000000000/payment-status')
      .set('Cookie', cookie)
      .send({ payment_status: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  afterAll(async () => {
    if (guestOrderId) await pool.query('DELETE FROM orders WHERE id = $1', [guestOrderId]).catch(() => {});
  });
});

describe('Payment API', () => {
  let productId: string;
  let createdOrderId: string | undefined;
  let createdProductId: string | undefined;
  const paymentFixtureIds: string[] = [];

  beforeAll(async () => {
    const productRes = await pool.query(
      `INSERT INTO products (id, name, slug, sku, type, price, stock_quantity, stock_status, manage_stock, is_featured, is_active)
       VALUES (uuid_generate_v4(), $1, $2, $3, 'simple', $4, $5, 'in_stock', true, false, true)
       RETURNING id`,
      ['Payment Test Product', `payment-test-${Date.now()}`, `PAY-${Date.now()}`, 499, 10]
    );
    productId = productRes.rows[0].id;
    createdProductId = productId;
  });

  it('POST /api/payment/summary returns backend-calculated totals', async () => {
    const res = await request(app)
      .post('/api/payment/summary')
      .send({ items: [{ id: productId, quantity: 2 }] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('subtotal');
    expect(res.body.data).toHaveProperty('shipping_amount');
    expect(res.body.data).toHaveProperty('total_amount');
    expect(res.body.data.total_amount).toBe(res.body.data.subtotal - res.body.data.discount_amount + res.body.data.shipping_amount);
  });

  it('POST /api/payment/create-cod-order stores the same total returned by summary', async () => {
    const summaryRes = await request(app)
      .post('/api/payment/summary')
      .send({ items: [{ id: productId, quantity: 1 }] });

    const createRes = await request(app)
      .post('/api/payment/create-cod-order')
      .send({
        items: [{ id: productId, quantity: 1 }],
        billing: { name: 'Guest Customer', email: 'guest@test.com' },
      });

    expect(createRes.status).toBe(200);
    expect(createRes.body.success).toBe(true);

    createdOrderId = createRes.body.data.dbOrderId;

    const orderRes = await pool.query(
      'SELECT subtotal, discount_amount, shipping_amount, total_amount FROM orders WHERE id = $1',
      [createdOrderId]
    );

    expect(Number(orderRes.rows[0].subtotal)).toBe(summaryRes.body.data.subtotal);
    expect(Number(orderRes.rows[0].discount_amount)).toBe(summaryRes.body.data.discount_amount);
    expect(Number(orderRes.rows[0].shipping_amount)).toBe(summaryRes.body.data.shipping_amount);
    expect(Number(orderRes.rows[0].total_amount)).toBe(summaryRes.body.data.total_amount);
  });

  it('POST /api/payment/verify-payment resolves the order from the stored Razorpay order id', async () => {
    const victimOrder = await pool.query(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, tax_amount, shipping_amount,
        discount_amount, total_amount, payment_status, payment_method, billing_address, shipping_address
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        null,
        `ORD-RZP-${Date.now()}`,
        'pending',
        499,
        0,
        0,
        0,
        499,
        'unpaid',
        'razorpay',
        JSON.stringify({ name: 'Guest Customer', email: 'guest@test.com' }),
        JSON.stringify({ name: 'Guest Customer', email: 'guest@test.com' }),
      ]
    );
    const victimOrderId = victimOrder.rows[0].id;
    paymentFixtureIds.push(victimOrderId);

    await pool.query(
      "INSERT INTO payments (order_id, transaction_id, provider, amount, currency, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [victimOrderId, 'order_test_secure', 'razorpay', 499, 'INR', 'created']
    );

    const otherOrder = await pool.query(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, tax_amount, shipping_amount,
        discount_amount, total_amount, payment_status, payment_method, billing_address, shipping_address
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        null,
        `ORD-OTHER-${Date.now()}`,
        'pending',
        100,
        0,
        0,
        0,
        100,
        'unpaid',
        'razorpay',
        JSON.stringify({ name: 'Other Guest', email: 'other@test.com' }),
        JSON.stringify({ name: 'Other Guest', email: 'other@test.com' }),
      ]
    );
    const otherOrderId = otherOrder.rows[0].id;
    paymentFixtureIds.push(otherOrderId);

    const signature = crypto.createHmac('sha256', 'dummy_secret').update('order_test_secure|pay_test_secure').digest('hex');

    const res = await request(app)
      .post('/api/payment/verify-payment')
      .send({
        razorpay_order_id: 'order_test_secure',
        razorpay_payment_id: 'pay_test_secure',
        razorpay_signature: signature,
        dbOrderId: otherOrderId,
        amount: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const verifiedOrderRes = await pool.query('SELECT payment_status, status FROM orders WHERE id = $1', [victimOrderId]);
    const otherOrderRes = await pool.query('SELECT payment_status, status FROM orders WHERE id = $1', [otherOrderId]);
    const paymentRes = await pool.query('SELECT status FROM payments WHERE transaction_id = $1', ['order_test_secure']);

    expect(verifiedOrderRes.rows[0].payment_status).toBe('paid');
    expect(verifiedOrderRes.rows[0].status).toBe('processing');
    expect(otherOrderRes.rows[0].payment_status).toBe('unpaid');
    expect(paymentRes.rows[0].status).toBe('succeeded');
  });

  it('POST /api/payment/verify-payment rejects replay verification', async () => {
    const signature = crypto.createHmac('sha256', 'dummy_secret').update('order_test_secure|pay_test_secure').digest('hex');

    const res = await request(app)
      .post('/api/payment/verify-payment')
      .send({
        razorpay_order_id: 'order_test_secure',
        razorpay_payment_id: 'pay_test_secure',
        razorpay_signature: signature,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  afterAll(async () => {
    if (createdOrderId) await pool.query('DELETE FROM orders WHERE id = $1', [createdOrderId]).catch(() => {});
    if (createdProductId) await pool.query('DELETE FROM products WHERE id = $1', [createdProductId]).catch(() => {});
    for (const orderId of paymentFixtureIds) {
      await pool.query('DELETE FROM orders WHERE id = $1', [orderId]).catch(() => {});
    }
  });
});

describe('Users API', () => {
  let cookie: string;
  let testUserId: string;

  beforeAll(async () => {
    cookie = await adminCookie();
  });

  it('GET /api/users returns paginated list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/users creates a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', cookie)
      .send({
        first_name: 'Jest',
        last_name: 'Tester',
        email: `jest-test-${Date.now()}@test.com`,
        password: 'TestPass123',
        role: 'customer',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.first_name).toBe('Jest');
    testUserId = res.body.data.id;
  });

  it('POST /api/users rejects missing email', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ first_name: 'No', last_name: 'Email', password: 'Test123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/users rejects short password', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ first_name: 'A', last_name: 'B', email: 'a@b.com', password: '12' });

    expect(res.status).toBe(400);
  });

  it('PATCH /api/users/:id/status toggles status', async () => {
    const res = await request(app)
      .patch(`/api/users/${testUserId}/status`)
      .set('Cookie', cookie)
      .send({ status: 'blocked' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('blocked');
  });

  it('PATCH /api/users/:id/status rejects invalid status', async () => {
    const res = await request(app)
      .patch(`/api/users/${testUserId}/status`)
      .set('Cookie', cookie)
      .send({ status: 'suspended' }); // not a valid option

    expect(res.status).toBe(400);
  });

  it('DELETE /api/users/:id deletes user', async () => {
    const res = await request(app)
      .delete(`/api/users/${testUserId}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) await pool.query('DELETE FROM users WHERE id = $1', [testUserId]).catch(() => {});
  });
});

describe('Categories API', () => {
  let cookie: string;
  let catId: string;

  beforeAll(async () => {
    cookie = await adminCookie();
  });

  it('GET /api/categories returns list', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.categories).toBeDefined();
  });

  afterAll(async () => {
    await pool.query("DELETE FROM categories WHERE slug = 'jest-test-cat'").catch(() => {});
  });
});

describe('Brands API', () => {
  let cookie: string;

  beforeAll(async () => {
    cookie = await adminCookie();
  });

  it('GET /api/brands returns list', async () => {
    const res = await request(app)
      .get('/api/brands')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.brands).toBeDefined();
  });
});
