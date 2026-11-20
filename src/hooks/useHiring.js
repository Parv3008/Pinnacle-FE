import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hiringService } from '../services/hiring.service.js';

export const useHirings = (params) =>
  useQuery({
    queryKey: ['hirings', params],
    queryFn: () => hiringService.list(params),
  });

export const useHiring = (id) =>
  useQuery({
    queryKey: ['hirings', id],
    queryFn: () => hiringService.getById(id),
    enabled: Boolean(id),
  });

export const useHiringMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['hirings'] });
    queryClient.invalidateQueries({ queryKey: ['job-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: hiringService.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => hiringService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, payload }) => hiringService.updateStatus(id, payload),
    onSuccess: invalidate,
  });

  const updateJoining = useMutation({
    mutationFn: ({ id, payload }) => hiringService.updateJoining(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: hiringService.remove,
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, updateJoining, remove };
};
