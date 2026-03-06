import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends httpOnly cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

// Auto redirect on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
