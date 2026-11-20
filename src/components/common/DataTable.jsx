import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import Loader from './Loader.jsx';
import EmptyState from './EmptyState.jsx';
import Pagination from './Pagination.jsx';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  sortBy,
  sortOrder,
  onSort,
  pagination,
  onPageChange,
  onRowClick,
  rowKey = '_id',
}) {
  const renderSortIcon = (key) => {
    if (!onSort || !key) return null;
    if (sortBy !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-primary-600" />
    ) : (
      <ArrowDown size={14} className="text-primary-600" />
    );
  };

  const primaryColumn = columns.find((column) => column.primary) || columns[0];
  const secondaryColumns = columns.filter((column) => column !== primaryColumn);
  const clickable = typeof onRowClick === 'function';

  const handleRowActivate = (row) => {
    if (!clickable) return;
    onRowClick(row);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Mobile card list */}
      <div className="divide-y divide-slate-100 md:hidden">
        {loading ? (
          <Loader />
        ) : data.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              actionLabel={emptyActionLabel}
              onAction={onEmptyAction}
            />
          </div>
        ) : (
          data.map((row) => (
            <div
              key={row[rowKey]}
              className={`space-y-3 px-4 py-4 ${
                clickable ? 'cursor-pointer transition hover:bg-slate-50/80' : ''
              }`}
              onClick={() => handleRowActivate(row)}
              onKeyDown={(event) => {
                if (!clickable) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleRowActivate(row);
                }
              }}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {primaryColumn?.header}
                  </p>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {primaryColumn?.render
                      ? primaryColumn.render(row)
                      : row[primaryColumn?.key] ?? '—'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {secondaryColumns.map((column) => (
                  <div
                    key={column.key}
                    className={`rounded-xl bg-slate-50 px-3 py-2 ${
                      column.key === 'actions' ? 'col-span-2' : ''
                    }`}
                    onClick={
                      column.key === 'actions' || column.stopRowClick
                        ? (event) => event.stopPropagation()
                        : undefined
                    }
                  >
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {column.header}
                    </p>
                    <div className="mt-1 text-sm text-slate-700">
                      {column.render ? column.render(row) : row[column.key] ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {column.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      {column.header}
                      {renderSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <Loader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row[rowKey]}
                  className={`hover:bg-slate-50/70 ${
                    clickable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleRowActivate(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-4 py-3 text-sm text-slate-700"
                      onClick={
                        column.key === 'actions' || column.stopRowClick
                          ? (event) => event.stopPropagation()
                          : undefined
                      }
                    >
                      {column.render ? column.render(row) : row[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-3 sm:px-4">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
