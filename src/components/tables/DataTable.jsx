import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  FiChevronDown, FiChevronUp, FiColumns, FiDownload, FiFilter, FiRefreshCw, FiX,
} from 'react-icons/fi';
import cn from '@/utils/cn';
import { exportToCsv, exportToPdf } from '@/utils/exporters';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import Dropdown from '@/components/common/Dropdown';
import Button from '@/components/common/Button';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

/**
 * Server-driven data table.
 *
 * Props:
 *  - columns: TanStack column defs (meta.exportHeader / meta.exportValue for exports)
 *  - data, pagination ({ total, totalPages, ... })
 *  - tableState: from useTableState()
 *  - isLoading, error, onRetry
 *  - title: used for export filenames
 *  - toolbar: extra filter controls (rendered next to search)
 *  - bulkActions: [{ label, icon?, danger?, onClick(selectedRows) }]
 *  - onExportExcel: optional server-side .xlsx export
 *  - enableSelection, onRowClick
 *  - empty: { title, description, actionLabel, onAction }
 */
export function DataTable({
  columns,
  data = [],
  pagination,
  tableState,
  isLoading,
  error,
  onRetry,
  title = 'export',
  toolbar,
  bulkActions = [],
  onExportExcel,
  enableSelection = false,
  onRowClick,
  empty = {},
  searchPlaceholder = 'Search…',
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const allColumns = useMemo(() => {
    if (!enableSelection) return columns;
    return [
      {
        id: '__select',
        enableSorting: false,
        enableHiding: false,
        size: 36,
        header: ({ table }) => (
          <input
            type="checkbox"
            aria-label="Select all rows"
            className="size-4 rounded border-surface-300 accent-primary-600"
            checked={table.getIsAllRowsSelected()}
            ref={(el) => el && (el.indeterminate = table.getIsSomeRowsSelected())}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label="Select row"
            className="size-4 rounded border-surface-300 accent-primary-600"
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      ...columns,
    ];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting: tableState.sorting,
      rowSelection,
      columnVisibility,
    },
    manualSorting: true,
    manualPagination: true,
    onSortingChange: tableState.setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, i) => row.id ?? String(i),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  const exportColumns = useMemo(
    () =>
      columns
        .filter((c) => c.id !== '__actions')
        .map((c) => ({
          header: c.meta?.exportHeader || (typeof c.header === 'string' ? c.header : c.id || c.accessorKey),
          accessor: (row) =>
            c.meta?.exportValue
              ? c.meta.exportValue(row)
              : c.accessorKey
                ? c.accessorKey.split('.').reduce((a, k) => a?.[k], row)
                : '',
        })),
    [columns]
  );

  const exportItems = [
    ...(onExportExcel
      ? [{ key: 'xlsx', label: 'Export Excel (.xlsx)', onClick: () => onExportExcel() }]
      : []),
    { key: 'csv', label: 'Export CSV', onClick: () => exportToCsv(title, data, exportColumns) },
    { key: 'pdf', label: 'Export PDF', onClick: () => exportToPdf(title, data, exportColumns) },
  ];

  const hasActiveFilters =
    tableState.search || Object.values(tableState.filters || {}).some((v) => v && v !== 'ALL');

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-surface-200 p-4 dark:border-surface-800 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={tableState.search}
            onChange={tableState.setSearch}
            placeholder={searchPlaceholder}
            className="w-full sm:max-w-xs"
          />
          {toolbar}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" leftIcon={FiX} onClick={tableState.resetFilters}>
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRetry && (
            <Button variant="ghost" size="sm" leftIcon={FiRefreshCw} onClick={onRetry} aria-label="Refresh">
              Refresh
            </Button>
          )}
          <Dropdown
            align="right"
            width="w-56"
            trigger={<Button variant="secondary" size="sm" leftIcon={FiColumns}>Columns</Button>}
            items={table
              .getAllLeafColumns()
              .filter((c) => c.id !== '__select' && c.getCanHide() !== false)
              .map((col) => ({
                key: col.id,
                label: (
                  <label className="flex w-full cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-3.5 accent-primary-600"
                      checked={col.getIsVisible()}
                      onChange={col.getToggleVisibilityHandler()}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {typeof col.columnDef.header === 'string'
                      ? col.columnDef.header
                      : col.columnDef.meta?.exportHeader || col.id}
                  </label>
                ),
                onClick: () => col.toggleVisibility(),
              }))}
          />
          <Dropdown
            align="right"
            trigger={<Button variant="secondary" size="sm" leftIcon={FiDownload}>Export</Button>}
            items={exportItems}
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedRows.length > 0 && bulkActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-primary-100 bg-primary-50 px-4 py-2.5 dark:border-primary-900 dark:bg-primary-950/50">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {selectedRows.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            {bulkActions.map((a) => (
              <Button
                key={a.label}
                size="xs"
                variant={a.danger ? 'danger' : 'secondary'}
                leftIcon={a.icon}
                onClick={async () => {
                  await a.onClick(selectedRows);
                  setRowSelection({});
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
          <button
            className="ml-auto text-xs text-primary-600 hover:underline dark:text-primary-400"
            onClick={() => setRowSelection({})}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Body */}
      {isLoading ? (
        <TableSkeleton cols={Math.min(columns.length, 6)} />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? FiFilter : undefined}
          title={hasActiveFilters ? 'No matching records' : empty.title || 'No records yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : empty.description || 'Records will appear here once created.'
          }
          actionLabel={!hasActiveFilters ? empty.actionLabel : undefined}
          onAction={empty.onAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-surface-200/80 bg-surface-50/80 dark:border-surface-800/80 dark:bg-surface-850/60">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.column.columnDef.size }}
                        className="px-4 py-2.5 text-left text-xs font-medium text-surface-500 dark:text-surface-400"
                        aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            className="inline-flex items-center gap-1 hover:text-surface-800 dark:hover:text-surface-200"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === 'asc' ? (
                              <FiChevronUp className="size-3.5" />
                            ) : sorted === 'desc' ? (
                              <FiChevronDown className="size-3.5" />
                            ) : (
                              <span className="size-3.5 opacity-0" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-surface-100 transition-colors last:border-0 dark:border-surface-800/70',
                    onRowClick && 'cursor-pointer',
                    row.getIsSelected()
                      ? 'bg-primary-50/60 dark:bg-primary-950/30'
                      : 'hover:bg-surface-50 dark:hover:bg-surface-850'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-surface-700 dark:text-surface-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {!isLoading && !error && data.length > 0 && (
        <Pagination
          pagination={pagination}
          page={tableState.page}
          limit={tableState.limit}
          onPageChange={tableState.setPage}
          onLimitChange={tableState.setLimit}
        />
      )}
    </div>
  );
}

export default DataTable;
