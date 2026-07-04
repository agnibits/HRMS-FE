import { z } from 'zod';
import { goalService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';

const STATUSES = ['ON_TRACK', 'AT_RISK', 'BEHIND', 'COMPLETED', 'CANCELLED'];

const schema = z.object({
  title: z.string().min(3, 'Objective title is required'),
  owner: z.string().min(1, 'Owner is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  progress: z.coerce.number().min(0, '0–100').max(100, '0–100'),
  status: z.enum(STATUSES),
  keyResults: z.string().max(1000).optional().or(z.literal('')),
});

function Progress({ value }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-primary-600' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-surface-500">{pct}%</span>
    </div>
  );
}

const columns = [
  {
    accessorKey: 'title',
    header: 'Objective',
    cell: ({ getValue }) => <span className="font-medium text-surface-900 dark:text-surface-100">{getValue()}</span>,
  },
  { accessorKey: 'owner', header: 'Owner' },
  { accessorKey: 'progress', header: 'Progress', cell: ({ getValue }) => <Progress value={getValue()} /> },
  { accessorKey: 'dueDate', header: 'Due', cell: ({ getValue }) => formatDate(getValue()) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip status={getValue() === 'ON_TRACK' ? 'IN_PROGRESS' : getValue() === 'AT_RISK' ? 'ON_HOLD' : getValue() === 'BEHIND' ? 'REJECTED' : getValue()} />,
  },
];

export default function Goals() {
  return (
    <ResourcePage
      title="Goals (OKRs)"
      description="Objectives and key results across teams and individuals."
      service={goalService}
      queryKey="goals"
      columns={columns}
      schema={schema}
      defaults={{ title: '', owner: '', dueDate: '', progress: 0, status: 'ON_TRACK', keyResults: '' }}
      fields={[
        { name: 'title', label: 'Objective', required: true, colSpan: 2, placeholder: 'e.g. Improve employee onboarding experience' },
        { name: 'owner', label: 'Owner', required: true },
        { name: 'dueDate', label: 'Due date', type: 'date', required: true },
        { name: 'progress', label: 'Progress (%)', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'keyResults', label: 'Key results (one per line)', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      createLabel="Add Objective"
    />
  );
}
