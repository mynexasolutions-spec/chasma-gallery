import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  // ── Login ────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('logs in with valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@store.com', password: 'Admin@1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('admin@store.com');
      expect(res.body.user.role).toBe('admin');
      // Cookie should be set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@store.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects missing fields (Zod validation)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@store.com' }); // missing password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'Secret123' });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('email');
    });
  });

  // ── Me ───────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('returns 401 without auth cookie', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns user info with valid cookie', async () => {
      // Login first
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@store.com', password: 'Admin@1234' });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('admin@store.com');
    });
  });

  // ── Logout ───────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('clears auth cookie', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@store.com', password: 'Admin@1234' });

      const cookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
