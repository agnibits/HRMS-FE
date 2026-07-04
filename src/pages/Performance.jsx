import { z } from 'zod';
import { performanceService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Badge, { StatusChip } from '@/components/common/Badge';

const STATUSES = ['DRAFT', 'IN_PROGRESS', 'COMPLETED'];
const CYCLES = ['Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL'];

const schema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  cycle: z.string().min(1, 'Review cycle is required'),
  reviewer: z.string().min(1, 'Reviewer is required'),
  score: z.coerce.number().min(0, 'Score 0–5').max(5, 'Score 0–5').optional(),
  status: z.enum(STATUSES),
  summary: z.string().max(1000).optional().or(z.literal('')),
});

function ScoreBadge({ score }) {
  if (score == null || score === '') return <span className="text-surface-400">—</span>;
  const color = score >= 4 ? 'green' : score >= 3 ? 'blue' : score >= 2 ? 'amber' : 'red';
  return <Badge color={color}>{Number(score).toFixed(1)} / 5</Badge>;
}

const columns = [
  {
    accessorKey: 'employee',
    header: 'Employee',
    cell: ({ row }) => (
      <span className="font-medium text-surface-900 dark:text-surface-100">
        {row.original.employeeName || row.original.employee}
      </span>
    ),
  },
  { accessorKey: 'cycle', header: 'Cycle', cell: ({ getValue }) => <Badge color="purple">{getValue()}</Badge> },
  { accessorKey: 'reviewer', header: 'Reviewer' },
  { accessorKey: 'score', header: 'Score', cell: ({ getValue }) => <ScoreBadge score={getValue()} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  { accessorKey: 'updatedAt', header: 'Updated', cell: ({ getValue }) => formatDate(getValue()) },
];

export default function Performance() {
  return (
    <ResourcePage
      title="Performance Management"
      description="Review cycles, ratings and feedback."
      service={performanceService}
      queryKey="performance-reviews"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', cycle: 'Q1', reviewer: '', score: '', status: 'DRAFT', summary: '' }}
      fields={[
        { name: 'employee', label: 'Employee', required: true, placeholder: 'Employee email or ID' },
        { name: 'reviewer', label: 'Reviewer', required: true },
        { name: 'cycle', label: 'Cycle', type: 'select', native: true, options: CYCLES.map((c) => ({ value: c, label: c })) },
        { name: 'score', label: 'Overall score (0–5)', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'summary', label: 'Summary & feedback', type: 'textarea', colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'cycle', label: 'Cycle', options: CYCLES },
      ]}
      createLabel="Start Review"
    />
  );
}
