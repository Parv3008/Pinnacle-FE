import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, CalendarDays, Pencil, Phone, UserRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import {
  AlertBanner,
  DetailCard,
  DetailGrid,
  DetailItem,
  HeroIdentity,
} from '../../components/common/DetailLayout.jsx';
import HiringForm from './forms/HiringForm.jsx';
import { useHiring, useHiringMutations } from '../../hooks/useHiring.js';
import { formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function HiringDetails() {
  const { hiringId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');

  const { data: hiring, isLoading, isError, error: queryError } = useHiring(hiringId);
  const { update } = useHiringMutations();

  if (isLoading) return <Loader label="Loading hiring record..." />;
  if (isError || !hiring) {
    return (
      <EmptyState
        title="Hiring record not found"
        description={getErrorMessage(queryError)}
        actionLabel="Back"
        onAction={() => navigate('/hirings')}
      />
    );
  }

  const companyId = hiring.companyId?._id || hiring.companyId;
  const jobProfileId = hiring.jobProfileId?._id || hiring.jobProfileId;
  const candidateId = hiring.candidateId?._id || hiring.candidateId;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title={hiring.candidateId?.fullName || 'Hiring'}
        subtitle={`${hiring.companyId?.companyName || 'Company'} · ${hiring.jobProfileId?.jobTitle || 'Role'}`}
        breadcrumbs={['Hiring', hiring.candidateId?.fullName || 'Details']}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/hirings')}>
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
        title={hiring.candidateId?.fullName || 'Hiring'}
        subtitle={`${hiring.companyId?.companyName || 'Company'} · ${hiring.jobProfileId?.jobTitle || 'Role'}`}
        badge={<StatusBadge status={hiring.joiningStatus || hiring.hiringStatus} />}
        avatarText={(hiring.candidateId?.fullName || 'H').slice(0, 1)}
        meta={[
          hiring.candidateId?.mobileNumber,
          formatDate(hiring.actualJoiningDate || hiring.createdAt),
        ].filter(Boolean)}
      />

      <DetailCard title="Hiring Details" description="Company, role and candidate linkage">
        <DetailGrid cols={3}>
          <DetailItem
            label="Company"
            value={
              <Link
                className="inline-flex items-center gap-1.5 text-primary-600"
                to={`/job-listing/companies/${companyId}`}
              >
                <Building2 size={14} />
                {hiring.companyId?.companyName || '—'}
              </Link>
            }
          />
          <DetailItem
            label="Role"
            value={
              <Link
                className="inline-flex items-center gap-1.5 text-primary-600"
                to={`/job-listing/companies/${companyId}/job-profiles/${jobProfileId}`}
              >
                <Briefcase size={14} />
                {hiring.jobProfileId?.jobTitle || '—'}
              </Link>
            }
          />
          <DetailItem
            label="Candidate"
            value={
              <Link
                className="inline-flex items-center gap-1.5 text-primary-600"
                to={`/candidates/${candidateId}`}
              >
                <UserRound size={14} />
                {hiring.candidateId?.fullName || '—'}
              </Link>
            }
          />
          <DetailItem
            label="Number"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                {hiring.candidateId?.mobileNumber || '—'}
              </span>
            }
          />
          <DetailItem
            label="Status"
            value={<StatusBadge status={hiring.joiningStatus || hiring.hiringStatus} />}
          />
          <DetailItem
            label="Hired Date"
            value={
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} className="text-slate-400" />
                {formatDate(hiring.actualJoiningDate || hiring.createdAt)}
              </span>
            }
          />
        </DetailGrid>
      </DetailCard>

      <HiringForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={hiring}
        loading={update.isPending}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync({ id: hiringId, payload: values });
            setEditOpen(false);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
