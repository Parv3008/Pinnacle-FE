import axios from 'axios';

const TOKEN_KEY = 'rms_admin_token';

export const tokenStorage = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  },
  set: (token) => {
    try {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore storage errors
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore storage errors
    }
  },
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pinnacle-be.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
          tokenStorage.clear();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
