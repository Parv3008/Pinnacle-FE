import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal.jsx';
import Input from '../../../components/common/Input.jsx';
import Select from '../../../components/common/Select.jsx';
import RoleSelect from '../../../components/common/RoleSelect.jsx';
import Textarea from '../../../components/common/Textarea.jsx';
import Button from '../../../components/common/Button.jsx';
import { JOB_PROFILE_STATUSES, SALARY_RANGE_OPTIONS } from '../../../utils/constants.js';
import { formatDate, nearestSalaryRangeValue } from '../../../utils/formatters.js';

const COUNT_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const value = String(i + 1);
  return { value, label: value };
});

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

const schema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Name is required'),
  requiredCandidates: z.coerce.number().int().min(1).max(10),
  experience: z.coerce.number().int().min(0).max(10),
  salary: z.coerce
    .number()
    .refine(
      (value) => SALARY_RANGE_OPTIONS.some((option) => Number(option.value) === Number(value)),
      { message: 'Select a salary range' }
    ),
  status: z.enum(['Active', 'Inactive', 'Completed']),
  questionsForRole: z.string().optional(),
});

const defaults = {
  companyId: '',
  jobTitle: '',
  requiredCandidates: '1',
  experience: '0',
  salary: '15000',
  status: 'Active',
  questionsForRole: '',
};

export default function JobProfileForm({
  open,
  onClose,
  initialData,
  companyId,
  companyOptions = [],
  onSubmit,
  loading,
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      initialData
        ? {
            companyId: initialData.companyId?._id || initialData.companyId || companyId || '',
            jobTitle: initialData.jobTitle || '',
            requiredCandidates: String(
              Math.min(10, Math.max(1, initialData.requiredCandidates ?? 1))
            ),
            experience: String(Math.min(10, Math.max(0, initialData.experience ?? 0))),
            salary: nearestSalaryRangeValue(initialData.salary),
            status: initialData.status || 'Active',
            questionsForRole: initialData.questionsForRole || '',
          }
        : { ...defaults, companyId: companyId || '' }
    );
  }, [open, initialData, companyId, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Job Profile' : 'Add Job Profile'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} onClick={handleSubmit(onSubmit)}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        {!companyId && (
          <div className="sm:col-span-2">
            <Controller
              name="companyId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Company *"
                  options={companyOptions}
                  placeholder="Select company"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  isClearable={false}
                  error={errors.companyId?.message}
                />
              )}
            />
          </div>
        )}
        {companyId && <input type="hidden" {...register('companyId')} />}

        <div className="sm:col-span-2">
          <Controller
            name="jobTitle"
            control={control}
            render={({ field }) => (
              <RoleSelect
                label="Name *"
                placeholder="Select role"
                value={field.value}
                existingValue={initialData?.jobTitle || ''}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                enabled={open}
                error={errors.jobTitle?.message}
              />
            )}
          />
        </div>

        <Controller
          name="requiredCandidates"
          control={control}
          render={({ field }) => (
            <Select
              label="Required Candidates *"
              options={COUNT_OPTIONS}
              placeholder="Select count"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              isSearchable={false}
              error={errors.requiredCandidates?.message}
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
        <Controller
          name="salary"
          control={control}
          render={({ field }) => (
            <Select
              label="Salary Range *"
              options={SALARY_RANGE_OPTIONS}
              placeholder="Select salary range"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              isSearchable={false}
              error={errors.salary?.message}
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status *"
              options={JOB_PROFILE_STATUSES}
              placeholder="Select status"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              isSearchable={false}
              error={errors.status?.message}
            />
          )}
        />

        {initialData?.createdAt && (
          <div className="sm:col-span-2">
            <Input label="Created Date" value={formatDate(initialData.createdAt)} disabled readOnly />
          </div>
        )}

        <div className="sm:col-span-2">
          <Textarea
            label="Questions for this role"
            rows={5}
            error={errors.questionsForRole?.message}
            {...register('questionsForRole')}
          />
        </div>
      </form>
    </Modal>
  );
}
