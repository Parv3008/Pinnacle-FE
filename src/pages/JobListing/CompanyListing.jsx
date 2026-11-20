import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Pencil, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import CompanyForm from './forms/CompanyForm.jsx';
import { useCompanies, useCompanyMutations } from '../../hooks/useCompanies.js';
import { formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';
import { COMPANY_STATUSES } from '../../utils/constants.js';

export default function CompanyListing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [error, setError] = useState('');

  const params = useMemo(
    () => ({ page, limit: 10, search, status, sortBy, sortOrder }),
    [page, search, status, sortBy, sortOrder]
  );

  const { data, isLoading, isError, error: queryError } = useCompanies(params);
  const { create, update, archive } = useCompanyMutations();

  const columns = [
    {
      key: 'companyName',
      header: 'Company Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-800">{row.companyName}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (row) => row.contactPerson || '—',
    },
    {
      key: 'contactNumber',
      header: 'Contact Number',
      render: (row) => row.contactNumber || '—',
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
            onClick={() => setArchiveTarget(row)}
            title="Archive"
          >
            <Archive size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

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
        title="Company Listing"
        subtitle="Manage companies and drill into their job profiles"
        breadcrumbs={['Job Listing', 'Companies']}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} />
            Add Company
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput
          className="sm:max-w-sm"
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search companies..."
        />
        <Select
          className="sm:max-w-xs"
          options={COMPANY_STATUSES}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder="All statuses"
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
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={data?.pagination}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/job-listing/companies/${row._id}`)}
        emptyTitle="No companies found"
        emptyActionLabel="Add Company"
        onEmptyAction={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <CompanyForm
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
        title="Archive company"
        message={`Archive ${archiveTarget?.companyName}? Related history will be preserved.`}
        confirmLabel="Archive"
        danger
        loading={archive.isPending}
        onConfirm={async () => {
          await archive.mutateAsync(archiveTarget._id);
          setArchiveTarget(null);
        }}
      />

      <p className="mt-3 text-xs text-slate-500">
        Tip: open a company to manage job profiles. <Link className="text-primary-600" to="/hirings">View hiring records</Link>
      </p>
    </div>
  );
}
