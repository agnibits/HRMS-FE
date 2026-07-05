import { z } from 'zod';
import dayjs from 'dayjs';
import { LuCalendarDays, LuSlidersHorizontal } from 'react-icons/lu';
import { leaveService, leaveTypeService } from '@/services/modules';
import { useAuth } from '@/hooks/useAuth';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import Tabs from '@/components/common/Tabs';
import ResourcePage from '@/components/common/ResourcePage';
import Badge, { StatusChip } from '@/components/common/Badge';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const BADGE_COLORS = ['blue', 'green', 'red', 'amber', 'orange', 'purple', 'violet', 'teal', 'gray'];

/* ---------------- Requests tab ---------------- */

function LeaveRequests() {
  const { options: typeOptions, codes, colorByCode } = useLeaveTypes();

  const schema = z
    .object({
      employee: z.string().min(1, 'Employee is required'),
      type: z.string().min(1, 'Select a leave type'),
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
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => (
        <Badge color={colorByCode[getValue()] || 'purple'}>{getValue()}</Badge>
      ),
    },
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

  return (
    <ResourcePage
      hideHeader
      title="Leave Requests"
      service={leaveService}
      queryKey="leaves"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', type: typeOptions[0]?.value || '', startDate: '', endDate: '', reason: '', status: 'PENDING' }}
      fields={[
        { name: 'employee', label: 'Employee', required: true, placeholder: 'Employee email or ID' },
        { name: 'type', label: 'Leave type', type: 'select', native: true, options: typeOptions },
        { name: 'startDate', label: 'Start date', type: 'date', required: true },
        { name: 'endDate', label: 'End date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s })) },
        { name: 'reason', label: 'Reason', type: 'textarea', required: true, colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'type', label: 'Type', options: codes },
      ]}
      createLabel="Request Leave"
    />
  );
}

/* ---------------- Leave Policy tab (company-configured types) ---------------- */

function LeavePolicy() {
  const schema = z.object({
    name: z.string().min(2, 'Name is required').max(50),
    code: z.string().min(1, 'Code is required').max(20),
    daysPerYear: z.coerce.number().min(0, '0 or more').max(365),
    paid: z.boolean().optional(),
    carryForward: z.boolean().optional(),
    maxCarryForward: z.coerce.number().min(0).max(365).optional(),
    color: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Leave Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Badge color={row.original.color || 'purple'}>{row.original.code}</Badge>
          <span className="font-medium text-surface-900 dark:text-surface-100">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'daysPerYear',
      header: 'Days / Year',
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{getValue() ?? '—'}</span>,
    },
    {
      accessorKey: 'paid',
      header: 'Paid',
      cell: ({ getValue }) =>
        getValue() ? <Badge color="green">Paid</Badge> : <Badge color="gray">Unpaid</Badge>,
    },
    {
      accessorKey: 'carryForward',
      header: 'Carry Forward',
      cell: ({ row }) =>
        row.original.carryForward ? (
          <Badge color="blue">Up to {row.original.maxCarryForward ?? '∞'}</Badge>
        ) : (
          <span className="text-surface-400">No</span>
        ),
    },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  ];

  return (
    <ResourcePage
      hideHeader
      title="Leave Types"
      service={leaveTypeService}
      queryKey="leave-types"
      columns={columns}
      schema={schema}
      defaults={{ name: '', code: '', daysPerYear: 0, paid: true, carryForward: false, maxCarryForward: 0, color: 'blue', status: 'ACTIVE' }}
      transformSubmit={(v) => ({ ...v, code: (v.code || '').toUpperCase().replace(/\s+/g, '_') })}
      fields={[
        { name: 'name', label: 'Leave type name', required: true, placeholder: 'e.g. Annual Leave' },
        { name: 'code', label: 'Code', required: true, placeholder: 'e.g. ANNUAL', hint: 'Short uppercase key' },
        { name: 'daysPerYear', label: 'Days allocated per year', type: 'number', required: true },
        { name: 'color', label: 'Badge color', type: 'select', native: true, options: BADGE_COLORS.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) })) },
        { name: 'paid', label: 'Paid leave (employee is paid during this leave)', type: 'checkbox', colSpan: 2 },
        { name: 'carryForward', label: 'Allow unused days to carry forward to next year', type: 'checkbox', colSpan: 2 },
        { name: 'maxCarryForward', label: 'Max days that can carry forward', type: 'number', hint: '0 = unlimited' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: [
          { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' },
        ] },
      ]}
      filters={[{ key: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE'] }]}
      createLabel="Add Leave Type"
      emptyDescription="Define your company's leave types — annual, sick, casual, and any custom types with their own allocation and rules."
    />
  );
}

/* ---------------- Page shell ---------------- */

export default function Leave() {
  const { isAdmin, hasPermission } = useAuth();
  const canManagePolicy = isAdmin || hasPermission('leave:manage');

  const tabs = [
    { key: 'requests', label: 'Requests', icon: LuCalendarDays },
    ...(canManagePolicy ? [{ key: 'policy', label: 'Leave Policy', icon: LuSlidersHorizontal }] : []),
  ];

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Requests, approvals and your company's leave policy."
      />
      <Tabs tabs={tabs}>
        {(active) => (active === 'policy' ? <LeavePolicy /> : <LeaveRequests />)}
      </Tabs>
    </div>
  );
}
