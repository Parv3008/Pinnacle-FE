import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service.js';

export const useDashboardOverview = () =>
  useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardService.getOverview,
  });

export const useHiringStats = () =>
  useQuery({
    queryKey: ['dashboard', 'hiring-stats'],
    queryFn: dashboardService.getHiringStats,
  });

export const useTradeStats = () =>
  useQuery({
    queryKey: ['dashboard', 'trade-stats'],
    queryFn: dashboardService.getTradeStats,
  });

export const useRecentActivities = () =>
  useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: dashboardService.getRecentActivities,
  });
