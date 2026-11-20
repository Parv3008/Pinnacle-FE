import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../../components/common/Modal.jsx';
import Select from '../../../components/common/Select.jsx';
import Button from '../../../components/common/Button.jsx';
import { useCompanies } from '../../../hooks/useCompanies.js';
import { useJobProfiles } from '../../../hooks/useJobProfiles.js';
import { useCandidates } from '../../../hooks/useCandidates.js';
import { formatSalaryRange } from '../../../utils/formatters.js';

const schema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  jobProfileId: z.string().min(1, 'Role is required'),
  candidateId: z.string().min(1, 'Candidate is required'),
});

const defaults = {
  companyId: '',
  jobProfileId: '',
  candidateId: '',
};

export default function HiringForm({
  open,
  onClose,
  initialData,
  defaults: preset = {},
  onSubmit,
  loading,
}) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const companyId = watch('companyId');
  const jobProfileId = watch('jobProfileId');
  const candidateId = watch('candidateId');

  const companiesQuery = useCompanies({ page: 1, limit: 100, status: 'Active' });
  const profilesQuery = useJobProfiles({
    page: 1,
    limit: 100,
    companyId: companyId || undefined,
  });
  const candidatesQuery = useCandidates({
    page: 1,
    limit: 100,
  });

  const companyOptions = useMemo(
    () =>
      (companiesQuery.data?.data || []).map((c) => ({
        value: c._id,
        label: c.companyName,
      })),
    [companiesQuery.data]
  );

  const openProfiles = useMemo(
    () =>
      (profilesQuery.data?.data || []).filter((p) => {
        if (initialData && (initialData.jobProfileId?._id || initialData.jobProfileId) === p._id) {
          return true;
        }
        return p.status !== 'Completed' && (p.remainingVacancies ?? 0) > 0;
      }),
    [profilesQuery.data, initialData]
  );

  const profileOptions = useMemo(
    () =>
      openProfiles.map((p) => ({
        value: p._id,
        label: `${p.jobTitle} · ${p.remainingVacancies ?? 0} vacancy left`,
      })),
    [openProfiles]
  );

  const candidateOptions = useMemo(
    () =>
      (candidatesQuery.data?.data || []).map((c) => ({
        value: c._id,
        label: `${c.fullName} · ${c.mobileNumber}${c.currentRole ? ` · ${c.currentRole}` : ''}`,
      })),
    [candidatesQuery.data]
  );

  const selectedProfile =
    openProfiles.find((p) => p._id === jobProfileId) ||
    (profilesQuery.data?.data || []).find((p) => p._id === jobProfileId);
  const selectedCandidate = (candidatesQuery.data?.data || []).find((c) => c._id === candidateId);

  const noVacancy =
    selectedProfile && !initialData && (selectedProfile.remainingVacancies ?? 0) <= 0;

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        companyId: initialData.companyId?._id || initialData.companyId || '',
        jobProfileId: initialData.jobProfileId?._id || initialData.jobProfileId || '',
        candidateId: initialData.candidateId?._id || initialData.candidateId || '',
      });
    } else {
      reset({ ...defaults, ...preset });
    }
  }, [open, initialData, preset, reset]);

  useEffect(() => {
    if (!initialData && companyId && !preset.jobProfileId) {
      setValue('jobProfileId', '');
    }
  }, [companyId, initialData, preset.jobProfileId, setValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Hiring' : 'Add Hiring'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            loading={loading}
            disabled={noVacancy || selectedProfile?.status === 'Completed'}
            onClick={handleSubmit(onSubmit)}
          >
            {initialData ? 'Update' : 'Hire Candidate'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
              isLoading={companiesQuery.isLoading}
              error={errors.companyId?.message}
            />
          )}
        />

        <Controller
          name="jobProfileId"
          control={control}
          render={({ field }) => (
            <Select
              label="Role / Job Profile *"
              options={profileOptions}
              placeholder={companyId ? 'Select role' : 'Select company first'}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              disabled={!companyId}
              isClearable={false}
              isLoading={profilesQuery.isLoading}
              error={errors.jobProfileId?.message}
            />
          )}
        />

        {selectedProfile && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Required: {selectedProfile.requiredCandidates} · Hired:{' '}
            {selectedProfile.totalHired ?? 0} · Remaining vacancies:{' '}
            <span className="font-semibold text-slate-900">
              {selectedProfile.remainingVacancies ?? 0}
            </span>
            {selectedProfile.salary != null
              ? ` · Salary: ${formatSalaryRange(selectedProfile.salary)}`
              : ''}
          </div>
        )}

        {(noVacancy || selectedProfile?.status === 'Completed') && !initialData && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {selectedProfile?.status === 'Completed'
              ? 'This role is Completed and cannot accept new hires.'
              : 'No vacancies left for this role.'}
          </div>
        )}

        <Controller
          name="candidateId"
          control={control}
          render={({ field }) => (
            <Select
              label="Candidate *"
              options={candidateOptions}
              placeholder="Select candidate"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              isClearable={false}
              isLoading={candidatesQuery.isLoading}
              error={errors.candidateId?.message}
            />
          )}
        />

        {selectedCandidate && (
          <p className="text-xs text-slate-500">
            {selectedCandidate.fullName} · {selectedCandidate.mobileNumber} · Called by{' '}
            {selectedCandidate.calledBy || '—'}
          </p>
        )}
      </form>
    </Modal>
  );
}
