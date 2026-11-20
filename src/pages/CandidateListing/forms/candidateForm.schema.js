import { z } from 'zod';
import { SALARY_RANGE_OPTIONS } from '../../../utils/constants.js';

export const CALLERS = ['Parv', 'Dhruv'];

export const NOTICE_PERIOD_OPTIONS = [
  { value: '0', label: 'Immediate' },
  { value: '7', label: '7 days' },
  { value: '15', label: '15 days' },
  { value: '30', label: '30 days' },
  { value: '45', label: '45 days' },
  { value: '60', label: '60 days' },
  { value: '75', label: '75 days' },
  { value: '90', label: '90 days' },
  { value: '120', label: '120 days' },
  { value: '180', label: '180 days' },
];

const optionalSalary = z.preprocess((value) => {
  if (value === '' || value == null) return 0;
  return value;
}, z.coerce.number().min(0));

export const candidateFormSchema = z.object({
  fullName: z.string().min(1, 'Name is required').trim(),
  mobileNumber: z.string().min(10, 'Valid number is required'),
  currentRole: z.string().min(1, 'Current role is required').trim(),
  experience: z.coerce.number().int().min(0).max(10),
  currentSalary: optionalSalary,
  expectedSalary: optionalSalary,
  currentJobLocation: z.string().optional().default(''),
  homeLocation: z.string().optional().default(''),
  remarks: z.string().optional().default(''),
  noticePeriodDays: z.coerce.number().min(0),
  calledBy: z.enum(['Parv', 'Dhruv']),
  callStatus: z.string().optional().default(''),
  followUpDate: z.string().nullable().optional(),
  interviewDate: z.string().nullable().optional(),
});

export const candidateFormDefaults = {
  fullName: '',
  mobileNumber: '',
  currentRole: '',
  experience: '0',
  currentSalary: 0,
  expectedSalary: '',
  currentJobLocation: '',
  homeLocation: '',
  remarks: '',
  noticePeriodDays: '0',
  calledBy: '',
  callStatus: '',
  followUpDate: '',
  interviewDate: '',
};

export const EXPECTED_SALARY_OPTIONS = SALARY_RANGE_OPTIONS;
