import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service.js';

export const useRoles = (params, options = {}) =>
  useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleService.list(params),
    ...options,
  });

export const useRoleOptions = (enabled = true) =>
  useRoles(
    { page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' },
    {
      enabled,
      select: (result) => ({
        ...result,
        data: (result?.data || []).filter((role) =>
          ['Active', 'Futurities'].includes(role.status)
        ),
      }),
    }
  );

export const useRole = (id) =>
  useQuery({
    queryKey: ['roles', id],
    queryFn: () => roleService.getById(id),
    enabled: Boolean(id),
  });

export const useRoleMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: roleService.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => roleService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => roleService.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: roleService.archive,
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, archive };
};
