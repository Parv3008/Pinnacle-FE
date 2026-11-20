import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyService } from '../services/company.service.js';

export const useCompanies = (params) =>
  useQuery({
    queryKey: ['companies', params],
    queryFn: () => companyService.list(params),
  });

export const useCompany = (id) =>
  useQuery({
    queryKey: ['companies', id],
    queryFn: () => companyService.getById(id),
    enabled: Boolean(id),
  });

export const useCompanyMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: companyService.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => companyService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => companyService.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: companyService.archive,
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, archive };
};
