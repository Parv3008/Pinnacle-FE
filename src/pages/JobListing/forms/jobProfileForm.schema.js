import { z } from 'zod';
import { JOB_PROFILE_STATUSES, SALARY_RANGE_OPTIONS } from '../../../utils/constants.js';

export const jobProfileFormSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Name is required').trim(),
  requiredCandidates: z.coerce.number().int().min(1).max(10),
  experience: z.coerce.number().int().min(0).max(10),
  salary: z.coerce
    .number()
    .refine(
      (value) => SALARY_RANGE_OPTIONS.some((option) => Number(option.value) === Number(value)),
      { message: 'Select a salary range' }
    ),
  status: z.enum(JOB_PROFILE_STATUSES).default('Active'),
  questionsForRole: z.string().optional().default(''),
});

export const jobProfileFormDefaults = {
  companyId: '',
  jobTitle: '',
  requiredCandidates: '1',
  experience: '0',
  salary: '15000',
  status: 'Active',
  questionsForRole: '',
};
