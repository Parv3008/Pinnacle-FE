import api from './api.js';
import { buildQueryParams } from '../utils/helpers.js';

export const hiringService = {
  list: async (params) => {
    const { data } = await api.get('/hirings', { params: buildQueryParams(params) });
    return { data: data.data, pagination: data.pagination };
  },
  getById: async (id) => {
    const { data } = await api.get(`/hirings/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post('/hirings', payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/hirings/${id}`, payload);
    return data.data;
  },
  updateStatus: async (id, payload) => {
    const { data } = await api.patch(`/hirings/${id}/status`, payload);
    return data.data;
  },
  updateJoining: async (id, payload) => {
    const { data } = await api.patch(`/hirings/${id}/joining`, payload);
    return data.data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/hirings/${id}`);
    return data.data;
  },
};
