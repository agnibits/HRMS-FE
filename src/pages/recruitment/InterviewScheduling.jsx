import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { interviewService } from '@/services/modules';
import { formatDateTime } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Calendar from '@/components/common/Calendar';
import Badge, { StatusChip } from '@/components/common/Badge';
import { candidateField } from '@/components/forms/refFields';

const STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const MODES = ['ONSITE', 'REMOTE', 'PHONE'];
const ROUNDS = ['Screening', 'Technical', 'System Design', 'Culture Fit', 'Final'];

const schema = z.object({
  candidate: z.string().min(1, 'Candidate is required'),
  jobTitle: z.string().optional().or(z.literal('')),
  round: z.string().min(1, 'Round is required'),
  interviewer: z.string().min(1, 'Interviewer is required'),
  scheduledAt: z.string().min(1, 'Date & time are required'),
  mode: z.enum(MODES),
  status: z.enum(STATUSES),
  notes: z.string().max(400).optional().or(z.literal('')),
});

const columns = [
  {
    accessorKey: 'candidate',
    header: 'Candidate',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">
          {row.original.candidateName || row.original.candidate}
        </p>
        <p className="text-xs text-surface-400">{row.original.jobTitle || ''}</p>
      </div>
    ),
  },
  { accessorKey: 'round', header: 'Round', cell: ({ getValue }) => <Badge color="purple">{getValue()}</Badge> },
  { accessorKey: 'interviewer', header: 'Interviewer' },
  {
    accessorKey: 'scheduledAt',
    header: 'When',
    cell: ({ getValue }) => <span className="whitespace-nowrap">{formatDateTime(getValue())}</span>,
  },
  { accessorKey: 'mode', header: 'Mode', cell: ({ getValue }) => <Badge color="blue">{getValue()}</Badge> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
];

export default function InterviewScheduling() {
  const calendarQuery = useQuery({
    queryKey: ['interviews', 'calendar'],
    queryFn: () => interviewService.list({ limit: 100 }),
    retry: false,
  });

  const events = (calendarQuery.data?.data || []).map((iv) => ({
    date: iv.scheduledAt,
    label: `${iv.candidateName || iv.candidate} — ${iv.round || 'Interview'}`,
    color: iv.status === 'COMPLETED' ? 'green' : iv.status === 'CANCELLED' ? 'red' : 'primary',
  }));

  return (
    <ResourcePage
      title="Interview Scheduling"
      description="Plan interview rounds and keep every panel in sync."
      service={interviewService}
      queryKey="interviews"
      columns={columns}
      schema={schema}
      defaults={{ candidate: '', jobTitle: '', round: 'Screening', interviewer: '', scheduledAt: '', mode: 'REMOTE', status: 'SCHEDULED', notes: '' }}
      fields={[
        candidateField(),
        { name: 'jobTitle', label: 'Position' },
        { name: 'round', label: 'Round', type: 'select', native: true, options: ROUNDS.map((r) => ({ value: r, label: r })) },
        { name: 'interviewer', label: 'Interviewer', required: true },
        { name: 'scheduledAt', label: 'Date & time', type: 'datetime-local', required: true },
        { name: 'mode', label: 'Mode', type: 'select', native: true, options: MODES.map((m) => ({ value: m, label: m })) },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'notes', label: 'Notes for the panel', type: 'textarea', colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'mode', label: 'Mode', options: MODES },
      ]}
      createLabel="Schedule Interview"
      beforeTable={events.length > 0 ? <Calendar events={events} className="mb-6" /> : null}
    />
  );
}
