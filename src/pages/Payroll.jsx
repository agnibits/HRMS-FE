import { z } from 'zod';
import { payrollService } from '@/services/modules';
import { formatCurrency } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';

const STATUSES = ['UNPAID', 'PROCESSING', 'PAID'];

const schema = z.object({
  employee: z.string().min(1, 'Employee is required'),
  period: z.string().min(1, 'Pay period is required'),
  gross: z.coerce.number().min(0, 'Gross must be positive'),
  deductions: z.coerce.number().min(0, 'Deductions must be positive'),
  bonus: z.coerce.number().min(0).optional(),
  status: z.enum(STATUSES),
});

const money = (v) => <span className="font-medium tabular-nums">{formatCurrency(v)}</span>;

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
  { accessorKey: 'period', header: 'Period' },
  { accessorKey: 'gross', header: 'Gross Pay', cell: ({ getValue }) => money(getValue()) },
  { accessorKey: 'deductions', header: 'Deductions', cell: ({ getValue }) => money(getValue()) },
  {
    accessorKey: 'net',
    header: 'Net Pay',
    cell: ({ row }) =>
      money(row.original.net ?? (row.original.gross || 0) + (row.original.bonus || 0) - (row.original.deductions || 0)),
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
];

export default function Payroll() {
  return (
    <ResourcePage
      title="Payroll"
      description="Monthly pay runs, salary components and payment status."
      service={payrollService}
      queryKey="payroll"
      columns={columns}
      schema={schema}
      defaults={{ employee: '', period: '', gross: 0, deductions: 0, bonus: 0, status: 'UNPAID' }}
      fields={[
        { name: 'employee', label: 'Employee', required: true, placeholder: 'Employee email or ID' },
        { name: 'period', label: 'Pay period', required: true, placeholder: 'e.g. 2026-07' },
        { name: 'gross', label: 'Gross pay', type: 'number', required: true },
        { name: 'deductions', label: 'Deductions', type: 'number', required: true },
        { name: 'bonus', label: 'Bonus', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s })) },
      ]}
      filters={[{ key: 'status', label: 'Status', options: STATUSES }]}
      createLabel="Add Pay Run"
      emptyDescription="Pay runs will appear here once payroll processing begins."
    />
  );
}
