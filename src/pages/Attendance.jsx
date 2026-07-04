import { z } from 'zod';
import { attendanceService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';
import { employeeField } from '@/components/forms/refFields';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'];

const schema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  checkIn: z.string().optional().or(z.literal('')),
  checkOut: z.string().optional().or(z.literal('')),
  status: z.enum(STATUSES),
  notes: z.string().max(200).optional().or(z.literal('')),
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
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'checkIn', header: 'Check In', cell: ({ getValue }) => getValue() || '—' },
  { accessorKey: 'checkOut', header: 'Check Out', cell: ({ getValue }) => getValue() || '—' },
  {
    accessorKey: 'workHours',
    header: 'Hours',
    cell: ({ getValue }) => (getValue() != null ? `${getValue()}h` : '—'),
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
];

export default function Attendance() {
  return (
    <ResourcePage
      title="Attendance"
      description="Daily check-ins, check-outs and attendance status."
      service={attendanceService}
      queryKey="attendance"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', date: '', checkIn: '', checkOut: '', status: 'PRESENT', notes: '' }}
      fields={[
        employeeField(),
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'checkIn', label: 'Check-in time', type: 'time' },
        { name: 'checkOut', label: 'Check-out time', type: 'time' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
        { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      createLabel="Mark Attendance"
      emptyDescription="Attendance records will appear here once employees start checking in."
    />
  );
}
