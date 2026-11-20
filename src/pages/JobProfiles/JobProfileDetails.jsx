import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  DoorOpen,
  Pencil,
  Plus,
  UserCheck,
  Users,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Select from '../../components/common/Select.jsx';
import {
  AlertBanner,
  DetailCard,
  DetailGrid,
  DetailItem,
  HeroIdentity,
  SectionHeader,
  StatCard,
} from '../../components/common/DetailLayout.jsx';
import JobProfileForm from './forms/JobProfileForm.jsx';
import HiringForm from '../Hiring/forms/HiringForm.jsx';
import { useJobProfile, useJobProfileMutations } from '../../hooks/useJobProfiles.js';
import { useHirings, useHiringMutations } from '../../hooks/useHiring.js';
import { JOB_PROFILE_STATUSES } from '../../utils/constants.js';
import { formatCurrency, formatDate, formatSalaryRange } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';

const experienceLabel = (value) =>
  Number(value) === 0 ? 'Fresher' : `${value ?? 0} years`;

export default function JobProfileDetails() {
  const { companyId, jobProfileId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [hiringOpen, setHiringOpen] = useState(false);
  const [error, setError] = useState('');

  const profileQuery = useJobProfile(jobProfileId);
  const hiringsQuery = useHirings({ jobProfileId, page: 1, limit: 50 });
  const { update, updateStatus } = useJobProfileMutations();
  const hiringMutations = useHiringMutations();

  const profile = profileQuery.data;
  const isCompleted = profile?.status === 'Completed';
  const remaining =
    profile?.remainingVacancies ??
    Math.max((profile?.requiredCandidates || 0) - (profile?.totalHired || 0), 0);

  const columns = useMemo(
    () => [
      {
        key: 'candidate',
        header: 'Candidate',
        primary: true,
        render: (row) => (
          <div>
            <p className="font-medium">{row.candidateId?.fullName}</p>
            <p className="text-xs text-slate-500">{row.candidateId?.mobileNumber || '—'}</p>
          </div>
        ),
      },
      {
        key: 'mobile',
        header: 'Mobile',
        render: (row) => row.candidateId?.mobileNumber || '—',
      },
      {
        key: 'hiringStatus',
        header: 'Status',
        render: (row) => <StatusBadge status={row.joiningStatus || row.hiringStatus} />,
      },
      {
        key: 'offeredSalary',
        header: 'Salary',
        render: (row) => formatCurrency(row.offeredSalary, row.salaryPeriod),
      },
      {
        key: 'joining',
        header: 'Hired Date',
        render: (row) => formatDate(row.actualJoiningDate || row.plannedJoiningDate || row.createdAt),
      },
    ],
    []
  );

  if (profileQuery.isLoading) return <Loader label="Loading job profile..." />;
  if (!profile) {
    return (
      <EmptyState
        title="Job profile not found"
        actionLabel="Back"
        onAction={() => navigate(`/job-listing/companies/${companyId}`)}
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title={profile.jobTitle}
        subtitle={profile.companyId?.companyName || 'Job profile'}
        breadcrumbs={[
          'Job Listing',
          profile.companyId?.companyName || 'Company',
          profile.jobTitle,
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(`/job-listing/companies/${companyId}`)}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={16} />
              Edit
            </Button>
            <Button
              disabled={isCompleted || remaining <= 0}
              onClick={() => setHiringOpen(true)}
              title={
                isCompleted
                  ? 'Completed profiles cannot accept new hiring'
                  : remaining <= 0
                    ? 'No vacancies left'
                    : ''
              }
            >
              <Plus size={16} />
              Add Hiring
            </Button>
          </>
        }
      />

      {error && <AlertBanner>{error}</AlertBanner>}
      {isCompleted && (
        <AlertBanner tone="warning">
          This profile is Completed. New hiring creation is disabled until you reactivate it.
        </AlertBanner>
      )}

      <HeroIdentity
        title={profile.jobTitle}
        subtitle={profile.companyId?.companyName || 'Company role'}
        badge={<StatusBadge status={profile.status} />}
        avatarText={profile.jobTitle?.slice(0, 1)}
        meta={[
          experienceLabel(profile.experience),
          profile.salary != null ? formatSalaryRange(profile.salary) : null,
          `${remaining} vacancy left`,
        ].filter(Boolean)}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Vacancies Left"
          value={remaining}
          hint={`of ${profile.requiredCandidates} required`}
          icon={DoorOpen}
          tone="amber"
        />
        <StatCard
          label="Total Hired"
          value={profile.totalHired}
          icon={UserCheck}
          tone="green"
        />
        <StatCard
          label="Original Requirement"
          value={profile.requiredCandidates}
          icon={Users}
          tone="indigo"
        />
        <StatCard
          label="Experience"
          value={experienceLabel(profile.experience)}
          icon={Briefcase}
          tone="blue"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DetailCard
          className="xl:col-span-2"
          title="Role Overview"
          description="Requirements and compensation for this profile"
        >
          <DetailGrid>
            <DetailItem label="Role Name" value={profile.jobTitle} />
            <DetailItem label="Status" value={<StatusBadge status={profile.status} />} />
            <DetailItem
              label="Vacancies"
              value={`${remaining} left · ${profile.requiredCandidates} required`}
            />
            <DetailItem label="Experience" value={experienceLabel(profile.experience)} />
            <DetailItem label="Salary" value={formatSalaryRange(profile.salary)} />
            <DetailItem label="Created Date" value={formatDate(profile.createdAt)} />
            <DetailItem
              className="sm:col-span-2"
              label="Questions for this role"
              value={
                <span className="whitespace-pre-wrap font-normal text-slate-700">
                  {profile.questionsForRole || '—'}
                </span>
              }
            />
          </DetailGrid>
        </DetailCard>

        <DetailCard title="Update Status" description="Control whether this role can accept hires">
          <Select
            label="Change status"
            options={JOB_PROFILE_STATUSES}
            value={profile.status}
            placeholder="Select status"
            isClearable={false}
            isSearchable={false}
            onChange={async (e) => {
              if (!e.target.value || e.target.value === profile.status) return;
              try {
                await updateStatus.mutateAsync({ id: jobProfileId, status: e.target.value });
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
          />
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Completed profiles cannot accept new hiring records. You can switch back to Active when
            vacancies reopen.
          </p>
        </DetailCard>
      </div>

      <div>
        <SectionHeader
          title="Hiring Records"
          description="Candidates hired against this role"
          actions={
            !isCompleted && remaining > 0 ? (
              <Button size="sm" onClick={() => setHiringOpen(true)}>
                <Plus size={16} />
                Add Hiring
              </Button>
            ) : null
          }
        />
        <DataTable
          columns={columns}
          data={hiringsQuery.data?.data || []}
          loading={hiringsQuery.isLoading}
          onRowClick={(row) => navigate(`/hirings/${row._id}`)}
          emptyTitle="No hiring records"
          emptyActionLabel={isCompleted || remaining <= 0 ? undefined : 'Add Hiring'}
          onEmptyAction={
            isCompleted || remaining <= 0 ? undefined : () => setHiringOpen(true)
          }
        />
      </div>

      <JobProfileForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        companyId={companyId}
        initialData={profile}
        loading={update.isPending}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync({ id: jobProfileId, payload: values });
            setEditOpen(false);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />

      <HiringForm
        open={hiringOpen}
        onClose={() => setHiringOpen(false)}
        defaults={{ companyId, jobProfileId }}
        loading={hiringMutations.create.isPending}
        onSubmit={async (values) => {
          try {
            await hiringMutations.create.mutateAsync(values);
            setHiringOpen(false);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
