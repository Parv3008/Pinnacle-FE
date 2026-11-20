import api from './api.js';
import { buildQueryParams } from '../utils/helpers.js';

export const candidateService = {
  list: async (params) => {
    const { data } = await api.get('/candidates', { params: buildQueryParams(params) });
    return { data: data.data, pagination: data.pagination };
  },
  checkDuplicate: async (mobile) => {
    const { data } = await api.get('/candidates', {
      params: { checkDuplicate: 'true', mobile },
    });
    return data.data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/candidates/${id}`);
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post('/candidates', payload);
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await api.patch(`/candidates/${id}`, payload);
    return data.data;
  },
  updateAvailability: async (id, payload) => {
    const { data } = await api.patch(`/candidates/${id}/availability`, payload);
    return data.data;
  },
  archive: async (id) => {
    const { data } = await api.delete(`/candidates/${id}`);
    return data.data;
  },
  uploadResume: async (id, file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const { data } = await api.post(`/candidates/${id}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  downloadResume: async (id, fileName = 'resume.pdf') => {
    const response = await api.get(`/candidates/${id}/resume`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  exportCsv: async (params) => {
    const response = await api.get('/candidates/export/csv', {
      params: buildQueryParams(params),
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'candidates.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
