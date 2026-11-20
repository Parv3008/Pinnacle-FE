import { z } from 'zod';
import { COMPANY_STATUSES } from '../../../utils/constants.js';

export const companyFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').trim(),
  status: z.enum(COMPANY_STATUSES).default('Active'),
  contactPerson: z.string().min(1, 'Contact person is required').trim(),
  contactNumber: z.string().min(1, 'Contact number is required').trim(),
});

export const companyFormDefaults = {
  companyName: '',
  status: 'Active',
  contactPerson: '',
  contactNumber: '',
};
