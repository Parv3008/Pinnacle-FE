import { useMemo, useState } from 'react';
import { Archive, Pencil, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Select from '../../components/common/Select.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RoleForm from './forms/RoleForm.jsx';
import { useRoles, useRoleMutations } from '../../hooks/useRoles.js';
import { formatDate } from '../../utils/formatters.js';
import { getErrorMessage } from '../../utils/helpers.js';
import { ROLE_STATUSES } from '../../utils/constants.js';

export default function RoleListing() {
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

  const { data, isLoading, isError, error: queryError } = useRoles(params);
  const { create, update, archive } = useRoleMutations();

  const columns = [
    {
      key: 'name',
      header: 'Role Name',
      primary: true,
      sortable: true,
      render: (row) => <span className="font-medium text-slate-800">{row.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
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
        title="Roles"
        subtitle="Manage roles for current and future vacancies"
        breadcrumbs={['Roles']}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} />
            Add Role
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
          placeholder="Search roles..."
        />
        <Select
          className="sm:max-w-xs"
          options={ROLE_STATUSES}
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
        emptyTitle="No roles found"
        emptyDescription="Add roles like Fitter, QC, CNC Operator to use in forms."
        emptyActionLabel="Add Role"
        onEmptyAction={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <RoleForm
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
        title="Archive role"
        message={`Archive ${archiveTarget?.name}? It will no longer appear in role dropdowns.`}
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
