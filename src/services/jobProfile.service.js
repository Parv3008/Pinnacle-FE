import api from './api.js';
import { buildQueryParams } from '../utils/helpers.js';

export const jobProfileService = {
  list: async (params) => {
    const { data } = await api.get('/job-profiles', { params: buildQueryParams(params) });
    return { data: data.data, pagination: data.pagination };
  },
  getById: async (id) => {
    const { data } = await api.get(`/job-profiles/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post('/job-profiles', payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/job-profiles/${id}`, payload);
    return data.data;
  },
  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/job-profiles/${id}/status`, { status });
    return data.data;
  },
  archive: async (id) => {
    const { data } = await api.delete(`/job-profiles/${id}`);
    return data.data;
  },
};
