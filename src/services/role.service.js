import api from './api.js';
import { buildQueryParams } from '../utils/helpers.js';

export const roleService = {
  list: async (params) => {
    const { data } = await api.get('/roles', { params: buildQueryParams(params) });
    return { data: data.data, pagination: data.pagination };
  },
  getById: async (id) => {
    const { data } = await api.get(`/roles/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post('/roles', payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/roles/${id}`, payload);
    return data.data;
  },
  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/roles/${id}/status`, { status });
    return data.data;
  },
  archive: async (id) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data.data;
  },
};
