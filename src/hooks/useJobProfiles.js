import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobProfileService } from '../services/jobProfile.service.js';

export const useJobProfiles = (params) =>
  useQuery({
    queryKey: ['job-profiles', params],
    queryFn: () => jobProfileService.list(params),
  });

export const useJobProfile = (id) =>
  useQuery({
    queryKey: ['job-profiles', id],
    queryFn: () => jobProfileService.getById(id),
    enabled: Boolean(id),
  });

export const useJobProfileMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['job-profiles'] });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: jobProfileService.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => jobProfileService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => jobProfileService.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: jobProfileService.archive,
    onSuccess: invalidate,
  });

  return { create, update, updateStatus, archive };
};
