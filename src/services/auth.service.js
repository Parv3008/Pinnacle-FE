import api from './api.js';

export const authService = {
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
