import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, CalendarDays, Phone, Pencil, UserRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import {
  AlertBanner,
  DetailCard,
  DetailGrid,
  DetailItem,
  HeroIdentity,
  SectionHeader,
  StatCard,
} from '../../components/common/DetailLayout.jsx';
import CandidateForm from './forms/CandidateForm.jsx';
import { useCandidate, useCandidateMutations } from '../../hooks/useCandidates.js';
import { formatCurrency, formatDate, formatSalaryRange } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';

const experienceLabel = (value) =>
  Number(value) === 0 ? 'Fresher' : `${value ?? 0} years`;

export default function CandidateDetails() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');

  const { data: candidate, isLoading, isError, error: queryError } = useCandidate(candidateId);
  const { update } = useCandidateMutations();

  if (isLoading) return <Loader label="Loading candidate..." />;
  if (isError || !candidate) {
    return (
      <EmptyState
        title="Candidate not found"
        description={getErrorMessage(queryError)}
        actionLabel="Back"
        onAction={() => navigate('/candidates')}
      />
    );
  }

  const hiringHistory = candidate.hiringHistory || [];

  const hiringColumns = [
    {
      key: 'company',
      header: 'Company',
      primary: true,
      render: (row) => row.companyId?.companyName || '—',
    },
    {
      key: 'job',
      header: 'Role',
      render: (row) => row.jobProfileId?.jobTitle || '—',
    },
    {
      key: 'hiringStatus',
      header: 'Status',
      render: (row) => <StatusBadge status={row.joiningStatus || row.hiringStatus} />,
    },
    {
      key: 'offeredSalary',
      header: 'Salary',
      render: (row) => formatCurrency(row.offeredSalary),
    },
    {
      key: 'joining',
      header: 'Hired Date',
      render: (row) => formatDate(row.actualJoiningDate || row.plannedJoiningDate || row.createdAt),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title={candidate.fullName}
        subtitle={candidate.currentRole || 'Candidate profile'}
        breadcrumbs={['Candidates', candidate.fullName]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/candidates')}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={16} />
              Edit
            </Button>
          </>
        }
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <HeroIdentity
        title={candidate.fullName}
        subtitle={candidate.currentRole || 'No role specified'}
        badge={<StatusBadge status={candidate.availabilityStatus} />}
        avatarText={candidate.fullName?.slice(0, 1)}
        meta={[
          candidate.mobileNumber,
          experienceLabel(candidate.experience),
          candidate.calledBy ? `Called by ${candidate.calledBy}` : null,
          candidate.callStatus || null,
        ].filter(Boolean)}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Experience"
          value={experienceLabel(candidate.experience)}
          icon={Briefcase}
          tone="indigo"
        />
        <StatCard
          label="Current Salary"
          value={formatCurrency(candidate.currentSalary)}
          icon={UserRound}
          tone="green"
        />
        <StatCard
          label="Notice Period"
          value={
            Number(candidate.noticePeriodDays) === 0
              ? 'Immediate'
              : `${candidate.noticePeriodDays ?? 0} days`
          }
          icon={CalendarDays}
          tone="amber"
        />
        <StatCard
          label="Hiring Records"
          value={hiringHistory.length}
          icon={Phone}
          tone="blue"
        />
      </div>

      <DetailCard title="Candidate Details" description="Personal and outreach information">
        <DetailGrid cols={3}>
          <DetailItem label="Name" value={candidate.fullName} />
          <DetailItem
            label="Number"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                {candidate.mobileNumber || '—'}
              </span>
            }
          />
          <DetailItem label="Current Role" value={candidate.currentRole || '—'} />
          <DetailItem label="Experience" value={experienceLabel(candidate.experience)} />
          <DetailItem label="Current Salary" value={formatCurrency(candidate.currentSalary)} />
          <DetailItem
            label="Expected Salary"
            value={
              Number(candidate.expectedSalary) > 0
                ? formatSalaryRange(candidate.expectedSalary)
                : '—'
            }
          />
          <DetailItem
            label="Current Job Location"
            value={candidate.currentJobLocation || '—'}
          />
          <DetailItem label="Home Location" value={candidate.homeLocation || '—'} />
          <DetailItem
            label="Notice Period"
            value={
              Number(candidate.noticePeriodDays) === 0
                ? 'Immediate'
                : `${candidate.noticePeriodDays ?? 0} days`
            }
          />
          <DetailItem label="Who called" value={candidate.calledBy || '—'} />
          <DetailItem
            label="Call Status"
            value={
              candidate.callStatus ? (
                <StatusBadge status={candidate.callStatus} />
              ) : (
                '—'
              )
            }
          />
          <DetailItem label="Next Follow-up" value={formatDate(candidate.followUpDate)} />
          <DetailItem label="Interview Date" value={formatDate(candidate.interviewDate)} />
          <DetailItem
            label="Availability"
            value={<StatusBadge status={candidate.availabilityStatus} />}
          />
          <DetailItem label="Created Date" value={formatDate(candidate.createdAt)} />
          <DetailItem
            className="sm:col-span-2 xl:col-span-3"
            label="Remarks"
            value={
              <span className="whitespace-pre-wrap font-normal text-slate-700">
                {candidate.remarks || '—'}
              </span>
            }
          />
        </DetailGrid>
      </DetailCard>

      <div>
        <SectionHeader
          title="Hiring History"
          description="Roles this candidate has been hired for"
        />
        <DataTable
          columns={hiringColumns}
          data={hiringHistory}
          onRowClick={(row) => navigate(`/hirings/${row._id}`)}
          emptyTitle="No hiring history"
          emptyDescription="This candidate has not been linked to any job yet."
        />
      </div>

      <CandidateForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={candidate}
        loading={update.isPending}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync({ id: candidateId, payload: values });
            setEditOpen(false);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
