import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../services/candidate.service.js';

export const useCandidates = (params) =>
  useQuery({
    queryKey: ['candidates', params],
    queryFn: () => candidateService.list(params),
  });

export const useCandidate = (id) =>
  useQuery({
    queryKey: ['candidates', id],
    queryFn: () => candidateService.getById(id),
    enabled: Boolean(id),
  });

export const useCandidateMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: candidateService.create,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }) => candidateService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateAvailability = useMutation({
    mutationFn: ({ id, payload }) => candidateService.updateAvailability(id, payload),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: candidateService.archive,
    onSuccess: invalidate,
  });

  const uploadResume = useMutation({
    mutationFn: ({ id, file }) => candidateService.uploadResume(id, file),
    onSuccess: invalidate,
  });

  return { create, update, updateAvailability, archive, uploadResume };
};
