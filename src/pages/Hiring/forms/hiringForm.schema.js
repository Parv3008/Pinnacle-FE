import { z } from 'zod';

const objectId = z.string().min(1, 'Selection is required');

export const hiringFormSchema = z.object({
  companyId: objectId,
  jobProfileId: objectId,
  candidateId: objectId,
});

export const hiringFormDefaults = {
  companyId: '',
  jobProfileId: '',
  candidateId: '',
};
