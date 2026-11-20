import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pinnacle-be.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthBootstrap = url.includes('/auth/login') || url.includes('/auth/me');
      if (!isAuthBootstrap && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
