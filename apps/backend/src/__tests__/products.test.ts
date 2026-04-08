import request from 'supertest';
import app from '../app';
import pool from '../config/db';

// Helper: login as admin and return cookie
async function adminCookie(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@store.com', password: 'Admin@1234' });
  return res.headers['set-cookie'] as string;
}

describe('Products API', () => {
  let cookie: string;
  let createdId: string;

  beforeAll(async () => {
    cookie = await adminCookie();
  });

  // ── List ─────────────────────────────────────────────────
  it('GET /api/products returns paginated list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('total');
  });

  // ── Create ───────────────────────────────────────────────
  it('POST /api/products creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({
        name: 'Test Product Jest',
        slug: 'test-product-jest',
        price: 49.99,
        stock_status: 'in_stock',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Product Jest');
    createdId = res.body.data.id;
  });

  // ── Validation ───────────────────────────────────────────
  it('POST /api/products rejects missing name', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ slug: 'no-name', price: 10 });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/products rejects negative price', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ name: 'Bad', slug: 'bad', price: -5 });

    expect(res.status).toBe(400);
  });

  it('POST /api/products rejects invalid slug format', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ name: 'Bad Slug', slug: 'Has Spaces!', price: 10 });

    expect(res.status).toBe(400);
  });

  // ── Requires auth ────────────────────────────────────────
  it('POST /api/products without auth returns 401', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'No Auth', slug: 'no-auth', price: 10 });

    expect(res.status).toBe(401);
  });

  // ── Get One ──────────────────────────────────────────────
  it('GET /api/products/:id returns the created product', async () => {
    const res = await request(app).get(`/api/products/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdId);
  });

  // ── Update ───────────────────────────────────────────────
  it('PUT /api/products/:id updates the product', async () => {
    const res = await request(app)
      .put(`/api/products/${createdId}`)
      .set('Cookie', cookie)
      .send({ name: 'Updated Jest Product', slug: 'test-product-jest', price: 59.99 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Jest Product');
  });

  // ── Delete ───────────────────────────────────────────────
  it('DELETE /api/products/:id deletes the product', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdId}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/products/:id returns 404 for deleted product', async () => {
    const res = await request(app).get(`/api/products/${createdId}`);
    expect(res.status).toBe(404);
  });

  afterAll(async () => {
    // Cleanup: ensure test product is deleted
    await pool.query("DELETE FROM products WHERE slug = 'test-product-jest'").catch(() => {});
  });
});
