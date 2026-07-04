import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LuEye } from 'react-icons/lu';
import { auditService } from '@/services/auditService';
import { QUERY_KEYS } from '@/constants';
import { formatDateTime, titleCase, truncate } from '@/utils/formatters';
import { useTableState } from '@/hooks/useTableState';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/tables/DataTable';
import { StatusChip } from '@/components/common/Badge';
import Badge from '@/components/common/Badge';
import Drawer from '@/components/common/Drawer';
import FilterSelect from '@/components/common/FilterSelect';
import { IconButton } from '@/components/common/Button';

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'RESTORE', 'EXPORT', 'IMPORT'];

function JsonBlock({ label, value }) {
  if (!value || Object.keys(value).length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-surface-400">{label}</p>
      <pre className="overflow-x-auto rounded-lg bg-surface-100 p-3 text-xs text-surface-700 dark:bg-surface-850 dark:text-surface-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export default function AuditLogs() {
  const tableState = useTableState({ sorting: [{ id: 'createdAt', desc: true }] });
  const [selected, setSelected] = useState(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.auditLogs, tableState.queryParams],
    queryFn: () => auditService.list(tableState.queryParams),
    keepPreviousData: true,
  });

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      meta: { exportValue: (r) => r.createdAt },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-surface-600 dark:text-surface-300">{formatDateTime(getValue())}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ getValue }) => <Badge color="primary">{titleCase(getValue())}</Badge>,
    },
    {
      accessorKey: 'entity',
      header: 'Entity',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-surface-800 dark:text-surface-200">{titleCase(row.original.entity)}</p>
          {row.original.entityId && (
            <p className="font-mono text-xs text-surface-400">{truncate(row.original.entityId, 20)}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'actorId',
      header: 'Actor',
      meta: { exportValue: (r) => r.actorId || '' },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-surface-500">{getValue() ? truncate(getValue(), 16) : 'system'}</span>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() || '—'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Result',
      cell: ({ getValue }) => <StatusChip status={getValue()} />,
    },
    {
      id: '__actions',
      header: '',
      enableSorting: false,
      size: 50,
      cell: ({ row }) => (
        <IconButton icon={LuEye} label="View details" size="sm" onClick={() => setSelected(row.original)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Complete, immutable trail of every sensitive action in the system."
      />

      <DataTable
        title="audit-logs"
        columns={columns}
        data={query.data?.data || []}
        pagination={query.data?.meta?.pagination}
        tableState={tableState}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={setSelected}
        searchPlaceholder="Search logs…"
        toolbar={
          <>
            <FilterSelect
              label="Action"
              value={tableState.filters.action}
              onChange={(v) => tableState.setFilter('action', v)}
              options={ACTIONS}
            />
            <FilterSelect
              label="Result"
              value={tableState.filters.status}
              onChange={(v) => tableState.setFilter('status', v)}
              options={['SUCCESS', 'FAILURE']}
            />
            <input
              type="date"
              aria-label="From date"
              className="input-base w-auto"
              value={tableState.filters.from || ''}
              onChange={(e) => tableState.setFilter('from', e.target.value)}
            />
            <input
              type="date"
              aria-label="To date"
              className="input-base w-auto"
              value={tableState.filters.to || ''}
              onChange={(e) => tableState.setFilter('to', e.target.value)}
            />
          </>
        }
        empty={{ title: 'No audit entries', description: 'Actions will be recorded here as they happen.' }}
      />

      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} title="Audit entry" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-surface-400">Action</p>
                <p className="mt-0.5 font-medium">{titleCase(selected.action)} · {titleCase(selected.entity)}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400">Result</p>
                <p className="mt-0.5"><StatusChip status={selected.status} /></p>
              </div>
              <div>
                <p className="text-xs text-surface-400">Timestamp</p>
                <p className="mt-0.5 font-medium">{formatDateTime(selected.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400">IP address</p>
                <p className="mt-0.5 font-mono text-xs">{selected.ipAddress || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-surface-400">Entity ID</p>
                <p className="mt-0.5 break-all font-mono text-xs">{selected.entityId || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-surface-400">Request ID</p>
                <p className="mt-0.5 break-all font-mono text-xs">{selected.requestId || '—'}</p>
              </div>
            </div>
            <JsonBlock label="Before" value={selected.before} />
            <JsonBlock label="After" value={selected.after} />
            <JsonBlock label="Metadata" value={selected.metadata} />
          </div>
        )}
      </Drawer>
    </div>
  );
}
