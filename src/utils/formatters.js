import { SALARY_RANGE_OPTIONS } from './constants.js';

export const formatCurrency = (value, period = '') => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
  return period ? `${formatted} / ${period}` : formatted;
};

export const formatSalaryRange = (value) => {
  if (value == null || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';

  const exact = SALARY_RANGE_OPTIONS.find((option) => Number(option.value) === num);
  if (exact) return exact.label;

  const bands = SALARY_RANGE_OPTIONS.map((option) => Number(option.value));
  let matched = SALARY_RANGE_OPTIONS[0];
  for (let i = 0; i < bands.length; i += 1) {
    if (num >= bands[i]) matched = SALARY_RANGE_OPTIONS[i];
  }
  return matched?.label || formatCurrency(num);
};

export const nearestSalaryRangeValue = (value) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return SALARY_RANGE_OPTIONS[0].value;

  const exact = SALARY_RANGE_OPTIONS.find((option) => Number(option.value) === num);
  if (exact) return exact.value;

  const bands = SALARY_RANGE_OPTIONS.map((option) => Number(option.value));
  let matched = bands[0];
  for (let i = 0; i < bands.length; i += 1) {
    if (num >= bands[i]) matched = bands[i];
  }
  return String(matched);
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatExperience = (value, unit = 'Years') => {
  if (value == null || value === '') return '—';
  return `${value} ${unit}`;
};

export const formatLocation = (...parts) => {
  return parts.filter(Boolean).join(', ') || '—';
};
