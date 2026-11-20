import api from './api.js';
import { buildQueryParams } from '../utils/helpers.js';

export const companyService = {
  list: async (params) => {
    const { data } = await api.get('/companies', { params: buildQueryParams(params) });
    return { data: data.data, pagination: data.pagination };
  },
  getById: async (id) => {
    const { data } = await api.get(`/companies/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post('/companies', payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/companies/${id}`, payload);
    return data.data;
  },
  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/companies/${id}/status`, { status });
    return data.data;
  },
  archive: async (id) => {
    const { data } = await api.delete(`/companies/${id}`);
    return data.data;
  },
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await api.post(`/companies/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
