import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { LuCheck, LuX } from 'react-icons/lu';
import { leaveService } from '@/services/modules';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { useUserLookup } from '@/hooks/useUserLookup';
import { useTableState } from '@/hooks/useTableState';
import { formatDate, formatRelative, truncate } from '@/utils/formatters';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/modals/Modal';
import Button from '@/components/common/Button';
import { Textarea } from '@/components/forms/fields';

function TypeChip({ color, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-medium text-surface-700 dark:bg-surface-800 dark:text-surface-200">
      <span className="size-2 rounded-full" style={{ background: color || '#64748b' }} />
      {children}
    </span>
  );
}

/** Manager approval queue — direct reports' leaves awaiting a decision. */
export default function LeaveApprovals() {
  const queryClient = useQueryClient();
  const tableState = useTableState({ sorting: [{ id: 'createdAt', desc: true }] });
  const { colorByCode } = useLeaveTypes();
  const { nameOf } = useUserLookup();
  const [rejecting, setRejecting] = useState(null); // leave row
  const [reason, setReason] = useState('');

  const query = useQuery({
    queryKey: ['leaves', 'approvals', tableState.queryParams],
    queryFn: () => leaveService.approvalQueue(tableState.queryParams),
    keepPreviousData: true,
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['leaves'] });

  const approve = useMutation({
    mutationFn: (id) => leaveService.approve(id),
    onSuccess: () => { toast.success('Leave approved'); invalidate(); },
    onError: (err) =>
      toast.error(err?.code === 'SELF_APPROVAL' ? 'You can’t approve your own leave.' : err.message),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => leaveService.reject(id, reason),
    onSuccess: () => {
      toast.success('Leave rejected');
      setRejecting(null);
      setReason('');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      accessorKey: 'employee',
      header: 'Employee',
      cell: ({ row }) => (
        <span className="font-medium text-surface-900 dark:text-surface-100">
          {row.original.employeeName || nameOf(row.original.employee || row.original.employeeId)}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => <TypeChip color={colorByCode[getValue()]}>{getValue()}</TypeChip>,
    },
    {
      accessorKey: 'startDate',
      header: 'Duration',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
        </span>
      ),
    },
    {
      accessorKey: 'days',
      header: 'Days',
      cell: ({ row }) =>
        row.original.days ?? dayjs(row.original.endDate).diff(dayjs(row.original.startDate), 'day') + 1,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-surface-500 dark:text-surface-400" title={getValue()}>{truncate(getValue(), 40)}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Applied',
      cell: ({ getValue }) => <span className="whitespace-nowrap text-surface-400">{formatRelative(getValue())}</span>,
    },
    {
      id: '__actions',
      header: '',
      enableSorting: false,
      size: 190,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="xs"
            leftIcon={LuCheck}
            loading={approve.isPending && approve.variables === row.original.id}
            onClick={() => approve.mutate(row.original.id)}
          >
            Approve
          </Button>
          <Button size="xs" variant="secondary" leftIcon={LuX} onClick={() => { setRejecting(row.original); setReason(''); }}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="leave-approvals"
        columns={columns}
        data={query.data?.data || []}
        pagination={query.data?.meta?.pagination}
        tableState={tableState}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        searchPlaceholder="Search approvals…"
        empty={{
          title: 'No pending approvals',
          description: 'Leave requests from your team that need a decision will appear here.',
        }}
      />

      <Modal
        isOpen={!!rejecting}
        onClose={() => setRejecting(null)}
        title="Reject leave request"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={reason.trim().length < 3}
              loading={reject.isPending}
              onClick={() => reject.mutate({ id: rejecting.id, reason: reason.trim() })}
            >
              Reject request
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-surface-600 dark:text-surface-300">
          Rejecting {rejecting?.employeeName || 'this employee'}’s leave. A reason is required and shared with them.
        </p>
        <Textarea
          autoFocus
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Team is understaffed that week — please pick alternate dates."
        />
      </Modal>
    </>
  );
}
