import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Pencil,
  Phone,
  Plus,
  UserCheck,
  UserRound,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import {
  AlertBanner,
  DetailCard,
  DetailGrid,
  DetailItem,
  HeroIdentity,
  SectionHeader,
  StatCard,
} from '../../components/common/DetailLayout.jsx';
import CompanyForm from './forms/CompanyForm.jsx';
import JobProfileForm from '../JobProfiles/forms/JobProfileForm.jsx';
import { useCompany, useCompanyMutations } from '../../hooks/useCompanies.js';
import { useJobProfiles, useJobProfileMutations } from '../../hooks/useJobProfiles.js';
import { formatSalaryRange, formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function CompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const companyQuery = useCompany(companyId);
  const profilesQuery = useJobProfiles({ companyId, page: 1, limit: 50 });
  const { update, updateStatus } = useCompanyMutations();
  const profileMutations = useJobProfileMutations();

  const company = companyQuery.data;

  const columns = useMemo(
    () => [
      {
        key: 'jobTitle',
        header: 'Name',
        primary: true,
        render: (row) => <span className="font-medium text-slate-800">{row.jobTitle}</span>,
      },
      {
        key: 'requiredCandidates',
        header: 'Vacancies Left',
        render: (row) =>
          row.remainingVacancies ??
          Math.max((row.requiredCandidates || 0) - (row.totalHired || 0), 0),
      },
      {
        key: 'experience',
        header: 'Experience',
        render: (row) =>
          Number(row.experience) === 0 ? 'Fresher' : `${row.experience ?? 0} yrs`,
      },
      {
        key: 'salary',
        header: 'Salary',
        render: (row) => formatSalaryRange(row.salary),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (row) => (
          <div className="flex gap-1">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              title="Edit"
              onClick={() => {
                setEditingProfile(row);
                setProfileOpen(true);
              }}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              title="Delete"
              onClick={() => setDeleteTarget(row)}
            >
              <Archive size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  if (companyQuery.isLoading) return <Loader label="Loading company..." />;
  if (companyQuery.isError || !company) {
    return (
      <EmptyState
        title="Company not found"
        description={getErrorMessage(companyQuery.error, 'Unable to load company')}
        actionLabel="Back to listing"
        onAction={() => navigate('/job-listing')}
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title={company.companyName}
        subtitle="Company details and job profiles"
        breadcrumbs={['Job Listing', 'Companies', company.companyName]}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/job-listing')}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={16} />
              Edit
            </Button>
            <Button
              onClick={() => {
                setEditingProfile(null);
                setProfileOpen(true);
              }}
            >
              <Plus size={16} />
              Add Job Profile
            </Button>
          </>
        }
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <HeroIdentity
        title={company.companyName}
        subtitle="Recruitment partner"
        badge={<StatusBadge status={company.status} />}
        avatarText={company.companyName?.slice(0, 1)}
        meta={[
          company.contactPerson ? `Contact: ${company.contactPerson}` : null,
          company.contactNumber || null,
          `Created ${formatDate(company.createdAt)}`,
        ].filter(Boolean)}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Job Profiles"
          value={company.totalJobProfiles}
          icon={Briefcase}
          tone="indigo"
        />
        <StatCard
          label="Active Profiles"
          value={company.activeProfiles}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Completed"
          value={company.completedProfiles}
          icon={Building2}
          tone="blue"
        />
        <StatCard
          label="Total Hired"
          value={company.totalHired}
          icon={UserCheck}
          tone="amber"
        />
      </div>

      <DetailCard
        title="Company Overview"
        description="Core company information"
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await updateStatus.mutateAsync({
                  id: companyId,
                  status: company.status === 'Active' ? 'Inactive' : 'Active',
                });
              }}
            >
              Mark {company.status === 'Active' ? 'Inactive' : 'Active'}
            </Button>
            <Link
              to={`/hirings?companyId=${companyId}`}
              className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-primary-600 hover:bg-primary-50"
            >
              View hirings
            </Link>
          </>
        }
      >
        <DetailGrid>
          <DetailItem label="Company Name" value={company.companyName} />
          <DetailItem label="Status" value={<StatusBadge status={company.status} />} />
          <DetailItem
            label="Contact Person"
            value={
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={14} className="text-slate-400" />
                {company.contactPerson || '—'}
              </span>
            }
          />
          <DetailItem
            label="Contact Number"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                {company.contactNumber || '—'}
              </span>
            }
          />
          <DetailItem label="Created Date" value={formatDate(company.createdAt)} />
        </DetailGrid>
      </DetailCard>

      <div>
        <SectionHeader
          title="Job Profiles"
          description="Roles and open vacancies for this company"
          actions={
            <Button
              size="sm"
              onClick={() => {
                setEditingProfile(null);
                setProfileOpen(true);
              }}
            >
              <Plus size={16} />
              Add Profile
            </Button>
          }
        />
        <DataTable
          columns={columns}
          data={profilesQuery.data?.data || []}
          loading={profilesQuery.isLoading}
          onRowClick={(row) =>
            navigate(`/job-listing/companies/${companyId}/job-profiles/${row._id}`)
          }
          emptyTitle="No job profiles yet"
          emptyActionLabel="Add Job Profile"
          onEmptyAction={() => {
            setEditingProfile(null);
            setProfileOpen(true);
          }}
        />
      </div>

      <CompanyForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={company}
        loading={update.isPending}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync({ id: companyId, payload: values });
            setEditOpen(false);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />

      <JobProfileForm
        open={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          setEditingProfile(null);
        }}
        companyId={companyId}
        initialData={editingProfile}
        loading={profileMutations.create.isPending || profileMutations.update.isPending}
        onSubmit={async (values) => {
          try {
            if (editingProfile) {
              await profileMutations.update.mutateAsync({
                id: editingProfile._id,
                payload: values,
              });
            } else {
              await profileMutations.create.mutateAsync(values);
            }
            setProfileOpen(false);
            setEditingProfile(null);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete job profile"
        message={`Delete ${deleteTarget?.jobTitle}? Hiring history will be preserved.`}
        confirmLabel="Delete"
        danger
        loading={profileMutations.archive.isPending}
        onConfirm={async () => {
          try {
            await profileMutations.archive.mutateAsync(deleteTarget._id);
            setDeleteTarget(null);
          } catch (err) {
            setError(getErrorMessage(err));
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
