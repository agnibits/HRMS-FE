import { z } from 'zod';
import { ticketService } from '@/services/modules';
import { formatRelative } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Badge, { StatusChip } from '@/components/common/Badge';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORIES = ['IT Support', 'HR Query', 'Payroll', 'Facilities', 'Access Request', 'Other'];
const priorityColor = { LOW: 'gray', MEDIUM: 'blue', HIGH: 'amber', URGENT: 'red' };

const schema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  requester: z.string().min(1, 'Requester is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(PRIORITIES),
  assignee: z.string().optional().or(z.literal('')),
  status: z.enum(STATUSES),
  description: z.string().min(5, 'Describe the issue').max(2000),
});

const columns = [
  {
    accessorKey: 'subject',
    header: 'Ticket',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.subject}</p>
        <p className="text-xs text-surface-400">{row.original.requesterName || row.original.requester}</p>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge color="teal">{getValue()}</Badge> },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ getValue }) => <Badge color={priorityColor[getValue()] || 'gray'} dot>{getValue()}</Badge>,
  },
  { accessorKey: 'assignee', header: 'Assignee', cell: ({ getValue }) => getValue() || <span className="text-surface-400">Unassigned</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  { accessorKey: 'updatedAt', header: 'Updated', cell: ({ getValue }) => formatRelative(getValue()) },
];

export default function HelpDesk() {
  return (
    <ResourcePage
      title="Help Desk"
      description="Internal support tickets for IT, HR and facilities."
      service={ticketService}
      queryKey="tickets"
      columns={columns}
      schema={schema}
      defaults={{ subject: '', requester: '', category: 'IT Support', priority: 'MEDIUM', assignee: '', status: 'OPEN', description: '' }}
      fields={[
        { name: 'subject', label: 'Subject', required: true, colSpan: 2 },
        { name: 'requester', label: 'Requester', required: true, placeholder: 'Employee email' },
        { name: 'category', label: 'Category', type: 'select', native: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        { name: 'priority', label: 'Priority', type: 'select', native: true, options: PRIORITIES.map((p) => ({ value: p, label: p })) },
        { name: 'assignee', label: 'Assignee' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'priority', label: 'Priority', options: PRIORITIES },
      ]}
      createLabel="New Ticket"
    />
  );
}
