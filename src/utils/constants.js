export const HIRING_STATUSES = [
  'Identified',
  'Contacted',
  'Interested',
  'Resume Submitted',
  'Interview Scheduled',
  'Selected',
  'Offer Accepted',
  'Joined',
  'Rejected',
  'Withdrawn',
  'On Hold',
];

export const JOINING_STATUSES = ['Pending', 'Joined', 'Not Joined', 'Cancelled'];

export const JOB_PROFILE_STATUSES = ['Active', 'Inactive', 'Completed'];

export const COMPANY_STATUSES = ['Active', 'Inactive'];

export const ROLE_STATUSES = ['Active', 'Inactive', 'Futurities'];

export const AVAILABILITY_STATUSES = [
  'Available',
  'Currently Working',
  'Notice Period',
  'Not Available',
  'Placed',
];

export const REFERENCE_TYPES = [
  'Employee Referral',
  'External Reference',
  'Direct',
  'Other',
];

export const SALARY_PERIODS = ['Monthly', 'Annual'];
export const SALARY_BASES = ['Gross', 'In-hand', 'CTC'];
export const EXPERIENCE_UNITS = ['Months', 'Years'];

/** Monthly salary bands for job profiles (value = band start / key amount). */
export const SALARY_RANGE_OPTIONS = [
  { value: '0', label: 'Below ₹10,000' },
  { value: '10000', label: '₹10,000 – ₹15,000' },
  { value: '15000', label: '₹15,000 – ₹20,000' },
  { value: '20000', label: '₹20,000 – ₹25,000' },
  { value: '25000', label: '₹25,000 – ₹30,000' },
  { value: '30000', label: '₹30,000 – ₹40,000' },
  { value: '40000', label: '₹40,000 – ₹50,000' },
  { value: '50000', label: '₹50,000 – ₹75,000' },
  { value: '75000', label: '₹75,000 – ₹1,00,000' },
  { value: '100000', label: 'Above ₹1,00,000' },
];

export const CANDIDATE_CALLERS = ['Parv', 'Dhruv'];

export const CANDIDATE_CALL_STATUSES = [
  'Not Connected',
  'Not Picking Up',
  'Call Back Later',
  'Interested',
  'Ready for Interview',
  'Interview Scheduled',
  'Not Interested',
  'Joined Elsewhere',
  'Wrong Number',
];

export const FOLLOW_UP_FILTERS = [
  { value: 'today', label: 'Follow-up today' },
  { value: 'overdue', label: 'Overdue follow-up' },
  { value: 'upcoming', label: 'Upcoming follow-up' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
