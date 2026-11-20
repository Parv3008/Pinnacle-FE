import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Archive, Download, Pencil, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import CandidateForm from './forms/CandidateForm.jsx';
import { useCandidates, useCandidateMutations } from '../../hooks/useCandidates.js';
import { candidateService } from '../../services/candidate.service.js';
import { formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';
import {
  CANDIDATE_CALL_STATUSES,
  CANDIDATE_CALLERS,
  FOLLOW_UP_FILTERS,
} from '../../utils/constants.js';

export default function CandidateListing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCalledBy = CANDIDATE_CALLERS.includes(searchParams.get('calledBy'))
    ? searchParams.get('calledBy')
    : '';
  const [search, setSearch] = useState('');
  const [calledBy, setCalledBy] = useState(initialCalledBy);
  const [callStatus, setCallStatus] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [error, setError] = useState('');

  const params = useMemo(
    () => ({ page, limit: 10, search, calledBy, callStatus, followUpFilter }),
    [page, search, calledBy, callStatus, followUpFilter]
  );

  const { data, isLoading, isError, error: queryError } = useCandidates(params);
  const { create, update, archive } = useCandidateMutations();

  const columns = [
    {
      key: 'fullName',
      header: 'Name',
      primary: true,
      render: (row) => <span className="font-medium text-slate-800">{row.fullName}</span>,
    },
    { key: 'mobileNumber', header: 'Number' },
    { key: 'currentRole', header: 'Current Role' },
    {
      key: 'callStatus',
      header: 'Call Status',
      render: (row) =>
        row.callStatus ? <StatusBadge status={row.callStatus} /> : '—',
    },
    {
      key: 'followUpDate',
      header: 'Follow-up',
      render: (row) => formatDate(row.followUpDate),
    },
    {
      key: 'interviewDate',
      header: 'Interview',
      render: (row) => formatDate(row.interviewDate),
    },
    {
      key: 'calledBy',
      header: 'Called By',
      render: (row) => row.calledBy || '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            title="Edit"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
            title="Archive"
            onClick={() => setArchiveTarget(row)}
          >
            <Archive size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    setError('');
    try {
      if (editing) {
        await update.mutateAsync({ id: editing._id, payload: values });
      } else {
        await create.mutateAsync(values);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Candidate Listing"
        subtitle="Track calls, follow-ups and interview readiness"
        breadcrumbs={['Candidates']}
        actions={
          <>
            <Button variant="secondary" onClick={() => candidateService.exportCsv(params)}>
              <Download size={16} />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus size={16} />
              Add Candidate
            </Button>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search name, number, role..."
        />
        <Select
          options={CANDIDATE_CALLERS}
          value={calledBy}
          onChange={(e) => {
            const next = e.target.value;
            setCalledBy(next);
            setPage(1);
            const nextParams = new URLSearchParams(searchParams);
            if (next) nextParams.set('calledBy', next);
            else nextParams.delete('calledBy');
            setSearchParams(nextParams, { replace: true });
          }}
          placeholder="All callers"
          isClearable
          isSearchable={false}
        />
        <Select
          options={CANDIDATE_CALL_STATUSES}
          value={callStatus}
          onChange={(e) => {
            setCallStatus(e.target.value);
            setPage(1);
          }}
          placeholder="All call statuses"
          isClearable
          isSearchable={false}
        />
        <Select
          options={FOLLOW_UP_FILTERS}
          value={followUpFilter}
          onChange={(e) => {
            setFollowUpFilter(e.target.value);
            setPage(1);
          }}
          placeholder="All follow-ups"
          isClearable
          isSearchable={false}
        />
      </div>

      {(error || isError) && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || getErrorMessage(queryError)}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/candidates/${row._id}`)}
        emptyTitle="No candidates found"
        emptyActionLabel="Add Candidate"
        onEmptyAction={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <CandidateForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initialData={editing}
        onSubmit={handleSubmit}
        loading={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive candidate"
        message={`Archive ${archiveTarget?.fullName}? Hiring history will remain.`}
        confirmLabel="Archive"
        danger
        loading={archive.isPending}
        onConfirm={async () => {
          await archive.mutateAsync(archiveTarget._id);
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
