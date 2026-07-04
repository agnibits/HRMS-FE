import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { LuBriefcaseBusiness, LuCalendarDays, LuUsersRound } from 'react-icons/lu';
import { jobService, candidateService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import PageHeader from '@/components/layout/PageHeader';
import Tabs from '@/components/common/Tabs';
import Badge, { StatusChip } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';

const JOB_STATUSES = ['OPEN', 'ON_HOLD', 'CLOSED'];
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];
const STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];

const jobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  department: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  type: z.enum(JOB_TYPES),
  openings: z.coerce.number().min(1, 'At least one opening'),
  status: z.enum(JOB_STATUSES),
  description: z.string().max(2000).optional().or(z.literal('')),
});

const candidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional().or(z.literal('')),
  jobTitle: z.string().min(1, 'Applied position is required'),
  stage: z.enum(STAGES),
  source: z.string().optional().or(z.literal('')),
});

const jobColumns = [
  {
    accessorKey: 'title',
    header: 'Position',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.title}</p>
        <p className="text-xs text-surface-400">{row.original.department || '—'} · {row.original.location || 'Remote'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => <Badge color="blue">{String(getValue() || '').replace('_', ' ')}</Badge>,
  },
  { accessorKey: 'openings', header: 'Openings' },
  { accessorKey: 'applicants', header: 'Applicants', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  { accessorKey: 'createdAt', header: 'Posted', cell: ({ getValue }) => formatDate(getValue()) },
];

const candidateColumns = [
  {
    accessorKey: 'firstName',
    header: 'Candidate',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-surface-900 dark:text-surface-100">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="truncate text-xs text-surface-400">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'jobTitle', header: 'Applied For' },
  { accessorKey: 'source', header: 'Source', cell: ({ getValue }) => getValue() || '—' },
  { accessorKey: 'stage', header: 'Stage', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  { accessorKey: 'createdAt', header: 'Applied', cell: ({ getValue }) => formatDate(getValue()) },
];

export default function Recruitment() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Recruitment"
        description="Open positions and your candidate pipeline."
        actions={
          <Button variant="secondary" leftIcon={LuCalendarDays} onClick={() => navigate('/recruitment/interviews')}>
            Interview Schedule
          </Button>
        }
      />

      <Tabs
        tabs={[
          { key: 'jobs', label: 'Job Openings', icon: LuBriefcaseBusiness },
          { key: 'candidates', label: 'Candidates', icon: LuUsersRound },
        ]}
      >
        {(active) =>
          active === 'jobs' ? (
            <ResourcePage
              hideHeader
              title="Jobs"
              service={jobService}
              queryKey="jobs"
              columns={jobColumns}
              schema={jobSchema}
              defaults={{ title: '', department: '', location: '', type: 'FULL_TIME', openings: 1, status: 'OPEN', description: '' }}
              fields={[
                { name: 'title', label: 'Job title', required: true, colSpan: 2 },
                { name: 'department', label: 'Department' },
                { name: 'location', label: 'Location', placeholder: 'e.g. Remote / Lahore' },
                { name: 'type', label: 'Employment type', type: 'select', native: true, options: JOB_TYPES.map((t) => ({ value: t, label: t.replace('_', ' ') })) },
                { name: 'openings', label: 'Openings', type: 'number', required: true },
                { name: 'status', label: 'Status', type: 'select', native: true, options: JOB_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
                { name: 'description', label: 'Job description', type: 'textarea', colSpan: 2 },
              ]}
              filters={[
                { key: 'status', label: 'Status', options: JOB_STATUSES },
                { key: 'type', label: 'Type', options: JOB_TYPES },
              ]}
              createLabel="Post Job"
            />
          ) : (
            <ResourcePage
              hideHeader
              title="Candidates"
              service={candidateService}
              queryKey="candidates"
              columns={candidateColumns}
              schema={candidateSchema}
              defaults={{ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', stage: 'APPLIED', source: '' }}
              fields={[
                { name: 'firstName', label: 'First name', required: true },
                { name: 'lastName', label: 'Last name', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'Phone' },
                { name: 'jobTitle', label: 'Applied position', required: true },
                { name: 'source', label: 'Source', placeholder: 'e.g. LinkedIn, Referral' },
                { name: 'stage', label: 'Stage', type: 'select', native: true, options: STAGES.map((s) => ({ value: s, label: s })) },
              ]}
              filters={[{ key: 'stage', label: 'Stage', options: STAGES }]}
              onRowClick={(row) => navigate(`/recruitment/candidates/${row.id}`)}
              createLabel="Add Candidate"
            />
          )
        }
      </Tabs>
    </div>
  );
}
