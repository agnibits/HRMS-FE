import { z } from 'zod';
import { onboardingService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import { useUserLookup } from '@/hooks/useUserLookup';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';
import { employeeField, userRefField } from '@/components/forms/refFields';

const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

const schema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  startDate: z.string().min(1, 'Start date is required'),
  buddy: z.string().optional().or(z.literal('')),
  status: z.enum(STATUSES),
  notes: z.string().max(400).optional().or(z.literal('')),
});

function ProgressBar({ value = 0 }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
        <div className="h-full rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-surface-500">{pct}%</span>
    </div>
  );
}

export default function Onboarding() {
  const { nameOf } = useUserLookup();

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
      cell: ({ getValue }) => <ProgressBar value={getValue()} />,
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
      defaults={{ employee: '', startDate: '', buddy: '', status: 'NOT_STARTED', notes: '' }}
      fields={[
        employeeField({ label: 'New hire', hint: 'The reporting manager is inherited from this employee’s profile.' }),
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        userRefField('buddy', 'Onboarding buddy', { hint: 'A peer who helps the new hire settle in.' }),
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      createLabel="Start Onboarding"
    />
  );
}
