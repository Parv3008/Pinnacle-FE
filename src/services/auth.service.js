import api, { tokenStorage } from './api.js';

export const authService = {
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    const payloadData = data.data || {};
    // Support both { user, token } and legacy user-only responses
    const user = payloadData.user || payloadData;
    const token = payloadData.token;
    if (token) tokenStorage.set(token);
    return user;
  },
  logout: async () => {
    try {
      const { data } = await api.post('/auth/logout');
      return data;
    } finally {
      tokenStorage.clear();
    }
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
