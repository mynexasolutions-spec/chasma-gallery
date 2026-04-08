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

  beforeAll(async () => {
    cookie = await adminCookie();
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
