import { z } from 'zod';
import { onboardingService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';

const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

const schema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  startDate: z.string().min(1, 'Start date is required'),
  buddy: z.string().optional().or(z.literal('')),
  manager: z.string().optional().or(z.literal('')),
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

const columns = [
  {
    accessorKey: 'employee',
    header: 'New Hire',
    cell: ({ row }) => (
      <span className="font-medium text-surface-900 dark:text-surface-100">
        {row.original.employeeName || row.original.employee}
      </span>
    ),
  },
  { accessorKey: 'startDate', header: 'Start Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'buddy', header: 'Buddy', cell: ({ getValue }) => getValue() || '—' },
  { accessorKey: 'manager', header: 'Manager', cell: ({ getValue }) => getValue() || '—' },
  {
    accessorKey: 'progress',
    header: 'Checklist',
    cell: ({ getValue }) => <ProgressBar value={getValue()} />,
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
];

export default function Onboarding() {
  return (
    <ResourcePage
      title="Onboarding"
      description="Track new-hire onboarding journeys and checklists."
      service={onboardingService}
      queryKey="onboarding"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', startDate: '', buddy: '', manager: '', status: 'NOT_STARTED', notes: '' }}
      fields={[
        { name: 'employee', label: 'New hire', required: true, placeholder: 'Employee email or ID' },
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        { name: 'buddy', label: 'Onboarding buddy' },
        { name: 'manager', label: 'Reporting manager' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      createLabel="Start Onboarding"
    />
  );
}
