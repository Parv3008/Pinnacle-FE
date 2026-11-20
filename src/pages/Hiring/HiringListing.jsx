import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import HiringForm from './forms/HiringForm.jsx';
import { useHirings, useHiringMutations } from '../../hooks/useHiring.js';
import { useCompanies } from '../../hooks/useCompanies.js';
import { formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';

export default function HiringListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCompanyId = searchParams.get('companyId') || '';

  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(
    () => ({
      page,
      limit: 10,
      search,
      companyId,
    }),
    [page, search, companyId]
  );

  const { data, isLoading, isError, error: queryError } = useHirings(params);
  const companiesQuery = useCompanies({ page: 1, limit: 100 });
  const { create } = useHiringMutations();

  const companyOptions = (companiesQuery.data?.data || []).map((c) => ({
    value: c._id,
    label: c.companyName,
  }));

  const columns = [
    {
      key: 'company',
      header: 'Company',
      render: (row) => row.companyId?.companyName || '—',
    },
    {
      key: 'job',
      header: 'Role',
      render: (row) => row.jobProfileId?.jobTitle || '—',
    },
    {
      key: 'candidate',
      header: 'Candidate',
      render: (row) => (
        <div>
          <p className="font-medium">{row.candidateId?.fullName}</p>
          <p className="text-xs text-slate-500">{row.candidateId?.mobileNumber || '—'}</p>
        </div>
      ),
    },
    {
      key: 'joiningStatus',
      header: 'Status',
      render: (row) => <StatusBadge status={row.joiningStatus || row.hiringStatus} />,
    },
    {
      key: 'createdAt',
      header: 'Hired Date',
      render: (row) => formatDate(row.actualJoiningDate || row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Hiring Records"
        subtitle="Assign candidates to company roles and track filled vacancies"
        breadcrumbs={['Hiring']}
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={16} />
            Add Hiring
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search company, role or candidate..."
        />
        <Select
          options={companyOptions}
          value={companyId}
          onChange={(e) => {
            setCompanyId(e.target.value);
            setPage(1);
          }}
          placeholder="All companies"
          isClearable
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
        onRowClick={(row) => navigate(`/hirings/${row._id}`)}
        emptyTitle="No hiring records"
        emptyActionLabel="Add Hiring"
        onEmptyAction={() => setFormOpen(true)}
      />

      <HiringForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaults={companyId ? { companyId } : {}}
        loading={create.isPending}
        onSubmit={async (values) => {
          setError('');
          try {
            await create.mutateAsync(values);
            setFormOpen(false);
          } catch (err) {
            setError(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
