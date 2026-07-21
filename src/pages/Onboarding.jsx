import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuPlay, LuCircleCheck } from 'react-icons/lu';
import { onboardingService } from '@/services/modules';
import { formatDate, titleCase } from '@/utils/formatters';
import { useUserLookup } from '@/hooks/useUserLookup';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';
import { employeeField, userRefField } from '@/components/forms/refFields';

const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

const schema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  startDate: z.string().min(1, 'Start date is required'),
  buddy: z.string().optional().or(z.literal('')),
  status: z.enum(STATUSES).optional(), // not set at create; defaults NOT_STARTED server-side
  notes: z.string().max(400).optional().or(z.literal('')),
});

function ChecklistCell({ row }) {
  const pct = Math.min(100, Math.max(0, Number(row.original.progress) || 0));
  const done = row.original.tasksDone;
  const total = row.original.tasksTotal;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="whitespace-nowrap text-xs text-surface-500">
        {total != null ? `${done ?? 0}/${total}` : `${pct}%`}
      </span>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { nameOf } = useUserLookup();
  const queryClient = useQueryClient();

  // One-click lifecycle progression (status drives progress on the backend).
  const setStatus = useMutation({
    mutationFn: ({ id, status }) => onboardingService.update(id, { status }),
    onSuccess: () => {
      toast.success('Onboarding updated');
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const columns = [
    {
      accessorKey: 'employee',
      header: 'New Hire',
      cell: ({ row }) => (
        <span className="font-medium text-surface-900 dark:text-surface-100">
          {nameOf(row.original.employeeName || row.original.employeeId || row.original.employee)}
        </span>
      ),
    },
    { accessorKey: 'startDate', header: 'Start Date', cell: ({ getValue }) => formatDate(getValue()) },
    { accessorKey: 'buddy', header: 'Buddy', cell: ({ row }) => nameOf(row.original.buddyName || row.original.buddy) },
    {
      accessorKey: 'manager',
      header: 'Reporting Manager',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.managerName || row.original.manager
          ? nameOf(row.original.managerName || row.original.manager)
          : <span className="text-surface-400">—</span>,
    },
    {
      accessorKey: 'progress',
      header: 'Checklist',
      cell: ({ row }) => <ChecklistCell row={row} />,
    },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  ];

  return (
    <ResourcePage
      title="Onboarding"
      description="Track new-hire onboarding journeys and checklists."
      service={onboardingService}
      queryKey="onboarding"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', startDate: '', buddy: '', notes: '' }}
      fields={[
        employeeField({ label: 'New hire', hint: 'The reporting manager is inherited from this employee’s profile.' }),
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        userRefField('buddy', 'Onboarding buddy', {
          hint: 'A peer who helps the new hire settle in.',
          remote: { excludeField: 'employee' }, // can't be their own buddy
        }),
        { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
        // Status is a lifecycle field — set it after creation (buttons below / edit),
        // never at create time. A new onboarding always starts NOT_STARTED.
        { name: 'status', label: 'Status', type: 'select', native: true, showOn: 'edit', options: STATUSES.map((s) => ({ value: s, label: titleCase(s) })) },
      ]}
      toEditValues={(row) => ({
        employee: row.employeeId || row.employee || '',
        startDate: row.startDate ? row.startDate.slice(0, 10) : '',
        buddy: row.buddy || '',
        notes: row.notes || '',
        status: row.status || 'NOT_STARTED',
      })}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      createLabel="Start Onboarding"
      onRowClick={(row) => navigate(`/onboarding/${row.id}`)}
      extraRowActions={(row) => {
        if (row.status === 'NOT_STARTED')
          return [{ icon: LuPlay, label: 'Start onboarding', onClick: () => setStatus.mutate({ id: row.id, status: 'IN_PROGRESS' }) }];
        if (row.status === 'IN_PROGRESS')
          return [{ icon: LuCircleCheck, label: 'Mark complete', onClick: () => setStatus.mutate({ id: row.id, status: 'COMPLETED' }) }];
        return [];
      }}
    />
  );
}
