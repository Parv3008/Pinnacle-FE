import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import DatePicker from '../../../components/common/DatePicker.jsx';
import Textarea from '../../../components/common/Textarea.jsx';
import RoleSelect from '../../../components/common/RoleSelect.jsx';
import Button from '../../../components/common/Button.jsx';
import { candidateService } from '../../../services/candidate.service.js';
import {
  CANDIDATE_CALL_STATUSES,
  SALARY_RANGE_OPTIONS,
} from '../../../utils/constants.js';
import { formatDate, nearestSalaryRangeValue } from '../../../utils/formatters.js';
import { toDateInputValue } from '../../../utils/helpers.js';

const CALLERS = ['Parv', 'Dhruv'];

const EXPERIENCE_OPTIONS = [
  { value: '0', label: 'Fresher' },
  ...Array.from({ length: 10 }, (_, i) => {
    const years = i + 1;
    return {
      value: String(years),
      label: years === 1 ? '1 year' : `${years} years`,
    };
  }),
];

const NOTICE_PERIOD_OPTIONS = [
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

const NOTICE_VALUES = NOTICE_PERIOD_OPTIONS.map((o) => Number(o.value));
const SALARY_VALUES = SALARY_RANGE_OPTIONS.map((o) => Number(o.value));

const optionalSalary = z.preprocess((value) => {
  if (value === '' || value == null) return 0;
  return value;
}, z.coerce.number().min(0));

const optionalDate = z.preprocess((value) => {
  if (value === '' || value == null) return null;
  return value;
}, z.union([z.null(), z.string()]));

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  mobileNumber: z
    .string()
    .min(10, 'Valid number is required')
    .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid mobile number'),
  currentRole: z.string().min(1, 'Current role is required'),
  experience: z.coerce.number().int().min(0).max(10),
  currentSalary: optionalSalary,
  expectedSalary: optionalSalary.refine(
    (value) => value === 0 || SALARY_VALUES.includes(Number(value)),
    { message: 'Select a valid expected salary range' }
  ),
  currentJobLocation: z.string().optional().default(''),
  homeLocation: z.string().optional().default(''),
  remarks: z.string().optional().default(''),
  noticePeriodDays: z.coerce.number().refine((value) => NOTICE_VALUES.includes(value), {
    message: 'Select a valid notice period',
  }),
  calledBy: z.enum(['Parv', 'Dhruv'], {
    required_error: 'Select who called this candidate',
  }),
  callStatus: z.string().optional().default(''),
  followUpDate: optionalDate,
  interviewDate: optionalDate,
});

const defaults = {
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

const nearestNoticePeriod = (value) => {
  const num = Number(value ?? 0);
  if (NOTICE_VALUES.includes(num)) return String(num);
  const closest = NOTICE_VALUES.reduce((prev, curr) =>
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  );
  return String(closest);
};

export default function CandidateForm({
  open,
  onClose,
  initialData,
  onSubmit,
  loading,
  serverError = '',
  fieldErrors = {},
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const [checkingMobile, setCheckingMobile] = useState(false);
  const [existingCandidate, setExistingCandidate] = useState(null);
  const mobileCheckSeq = useRef(0);
  const mobileNumber = watch('mobileNumber');

  useEffect(() => {
    if (!open) return;
    setExistingCandidate(null);
    mobileCheckSeq.current += 1;
    reset(
      initialData
        ? {
            fullName: initialData.fullName || '',
            mobileNumber: initialData.mobileNumber || '',
            currentRole: initialData.currentRole || '',
            experience: String(Math.min(10, Math.max(0, initialData.experience ?? 0))),
            currentSalary: initialData.currentSalary ?? 0,
            expectedSalary:
              initialData.expectedSalary != null && Number(initialData.expectedSalary) > 0
                ? nearestSalaryRangeValue(initialData.expectedSalary)
                : '',
            currentJobLocation: initialData.currentJobLocation || '',
            homeLocation: initialData.homeLocation || '',
            remarks: initialData.remarks || '',
            noticePeriodDays: nearestNoticePeriod(initialData.noticePeriodDays),
            calledBy: initialData.calledBy || '',
            callStatus: initialData.callStatus || '',
            followUpDate: toDateInputValue(initialData.followUpDate),
            interviewDate: toDateInputValue(initialData.interviewDate),
          }
        : defaults
    );
  }, [open, initialData, reset]);

  useEffect(() => {
    if (fieldErrors?.mobileNumber) {
      setError('mobileNumber', { type: 'server', message: fieldErrors.mobileNumber });
    }
  }, [fieldErrors, setError]);

  useEffect(() => {
    if (!open) return undefined;

    const digits = digitsOnly(mobileNumber);
    if (digits.length < 10) {
      setExistingCandidate(null);
      if (errors.mobileNumber?.type === 'duplicate') {
        clearErrors('mobileNumber');
      }
      return undefined;
    }

    const seq = ++mobileCheckSeq.current;
    const timer = setTimeout(async () => {
      setCheckingMobile(true);
      try {
        const result = await candidateService.checkMobile(mobileNumber, initialData?._id);
        if (seq !== mobileCheckSeq.current) return;

        if (result?.exists && result.candidate) {
          setExistingCandidate(result.candidate);
          setError('mobileNumber', {
            type: 'duplicate',
            message: `Candidate already exists (${result.candidate.candidateCode} - ${result.candidate.fullName})`,
          });
        } else {
          setExistingCandidate(null);
          if (errors.mobileNumber?.type === 'duplicate') {
            clearErrors('mobileNumber');
          }
        }
      } catch {
        if (seq !== mobileCheckSeq.current) return;
        // Keep local validation; create/update API still enforces uniqueness.
      } finally {
        if (seq === mobileCheckSeq.current) setCheckingMobile(false);
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when mobile changes
  }, [mobileNumber, open, initialData?._id]);

  const verifyMobileBeforeSubmit = async (value) => {
    const digits = digitsOnly(value);
    if (digits.length < 10) return false;

    setCheckingMobile(true);
    try {
      const result = await candidateService.checkMobile(value, initialData?._id);
      if (result?.exists && result.candidate) {
        setExistingCandidate(result.candidate);
        setError('mobileNumber', {
          type: 'duplicate',
          message: `Candidate already exists (${result.candidate.candidateCode} - ${result.candidate.fullName})`,
        });
        return false;
      }
      setExistingCandidate(null);
      if (errors.mobileNumber?.type === 'duplicate') clearErrors('mobileNumber');
      return true;
    } catch {
      return true;
    } finally {
      setCheckingMobile(false);
    }
  };

  const submit = handleSubmit(async (values) => {
    const ok = await verifyMobileBeforeSubmit(values.mobileNumber || getValues('mobileNumber'));
    if (!ok) return;

    const payload = {
      ...values,
      callStatus: values.callStatus || '',
      followUpDate: values.followUpDate || null,
      interviewDate: values.interviewDate || null,
    };
    return onSubmit?.(payload);
  });

  const mobileError = errors.mobileNumber?.message;
  const mobileHelper = checkingMobile
    ? 'Checking if this number already exists…'
    : existingCandidate
      ? undefined
      : digitsOnly(mobileNumber).length >= 10
        ? 'Number is available'
        : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Candidate' : 'Add Candidate'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading || checkingMobile}>
            Cancel
          </Button>
          <Button
            loading={loading || checkingMobile}
            onClick={submit}
            disabled={Boolean(existingCandidate)}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      {serverError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <div className="sm:col-span-2">
          <Input label="Name *" error={errors.fullName?.message} {...register('fullName')} />
        </div>
        <Input
          label="Number *"
          error={mobileError}
          helperText={!mobileError ? mobileHelper : undefined}
          {...register('mobileNumber')}
        />
        <Controller
          name="currentRole"
          control={control}
          render={({ field }) => (
            <RoleSelect
              label="Current Role *"
              placeholder="Select role"
              value={field.value}
              existingValue={initialData?.currentRole || ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              enabled={open}
              error={errors.currentRole?.message}
            />
          )}
        />
        <Controller
          name="experience"
          control={control}
          render={({ field }) => (
            <Select
              label="Experience *"
              options={EXPERIENCE_OPTIONS}
              placeholder="Select experience"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              error={errors.experience?.message}
            />
          )}
        />
        <Input
          label="Current Salary"
          type="number"
          error={errors.currentSalary?.message}
          {...register('currentSalary')}
        />
        <Controller
          name="expectedSalary"
          control={control}
          render={({ field }) => (
            <Select
              label="Expected Salary"
              options={SALARY_RANGE_OPTIONS}
              placeholder="Select expected salary (optional)"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable
              isSearchable={false}
              error={errors.expectedSalary?.message}
            />
          )}
        />
        <Input
          label="Current Job Location"
          placeholder="e.g. Ahmedabad"
          error={errors.currentJobLocation?.message}
          {...register('currentJobLocation')}
        />
        <Input
          label="Home Location"
          placeholder="e.g. Surat"
          error={errors.homeLocation?.message}
          {...register('homeLocation')}
        />
        <Controller
          name="noticePeriodDays"
          control={control}
          render={({ field }) => (
            <Select
              label="Notice Period *"
              options={NOTICE_PERIOD_OPTIONS}
              placeholder="Select notice period"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              error={errors.noticePeriodDays?.message}
            />
          )}
        />
        <Controller
          name="calledBy"
          control={control}
          render={({ field }) => (
            <Select
              label="Who called this candidate *"
              options={CALLERS}
              placeholder="Select caller"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              isSearchable={false}
              error={errors.calledBy?.message}
            />
          )}
        />

        <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">Call follow-up</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="callStatus"
              control={control}
              render={({ field }) => (
                <Select
                  label="Call Status"
                  options={CANDIDATE_CALL_STATUSES}
                  placeholder="Select call status (optional)"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  isClearable
                  isSearchable={false}
                  error={errors.callStatus?.message}
                />
              )}
            />
            <Controller
              name="followUpDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Next Follow-up Date"
                  placeholder="Select follow-up date"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.followUpDate?.message}
                />
              )}
            />
            <Controller
              name="interviewDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Interview Date"
                  placeholder="Select interview date"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  error={errors.interviewDate?.message}
                />
              )}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Use follow-up date for callback / not picking up. Use interview date when a slot is
            fixed.
          </p>
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Remarks"
            rows={4}
            placeholder="Write any notes about this candidate..."
            error={errors.remarks?.message}
            {...register('remarks')}
          />
        </div>
        {initialData?.createdAt && (
          <Input
            label="Created Date"
            value={formatDate(initialData.createdAt)}
            disabled
            readOnly
          />
        )}
      </form>
    </Modal>
  );
}
