import api from './api.js';

export const dashboardService = {
  getOverview: async () => {
    const { data } = await api.get('/dashboard/overview');
    return data.data;
  },
  getHiringStats: async () => {
    const { data } = await api.get('/dashboard/hiring-stats');
    return data.data;
  },
  getTradeStats: async () => {
    const { data } = await api.get('/dashboard/trade-stats');
    return data.data;
  },
  getRecentActivities: async () => {
    const { data } = await api.get('/dashboard/recent-activities');
    return data.data;
  },
};
