import { z } from 'zod';
import dayjs from 'dayjs';
import { leaveService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';
import Badge from '@/components/common/Badge';

const TYPES = ['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const schema = z
  .object({
    employee: z.string().min(1, 'Employee is required'),
    type: z.enum(TYPES),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().min(5, 'Please provide a short reason').max(400),
    status: z.enum(STATUSES),
  })
  .refine((d) => !dayjs(d.endDate).isBefore(dayjs(d.startDate)), {
    path: ['endDate'],
    message: 'End date cannot be before the start date',
  });

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
  { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <Badge color="purple">{getValue()}</Badge> },
  {
    accessorKey: 'startDate',
    header: 'Duration',
    meta: { exportValue: (r) => `${r.startDate} → ${r.endDate}` },
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
      row.original.days ??
      dayjs(row.original.endDate).diff(dayjs(row.original.startDate), 'day') + 1,
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
];

export default function Leave() {
  return (
    <ResourcePage
      title="Leave Management"
      description="Requests, approvals and leave balances."
      service={leaveService}
      queryKey="leaves"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '', status: 'PENDING' }}
      fields={[
        { name: 'employee', label: 'Employee', required: true, placeholder: 'Employee email or ID' },
        { name: 'type', label: 'Leave type', type: 'select', native: true, options: TYPES.map((t) => ({ value: t, label: t })) },
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        { name: 'endDate', label: 'End date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s })) },
        { name: 'reason', label: 'Reason', type: 'textarea', required: true, colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'type', label: 'Type', options: TYPES },
      ]}
      createLabel="Request Leave"
    />
  );
}
