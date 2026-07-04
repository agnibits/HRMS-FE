import { z } from 'zod';
import { expenseService } from '@/services/modules';
import { formatDate, formatCurrency } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Badge, { StatusChip } from '@/components/common/Badge';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED'];
const CATEGORIES = ['Travel', 'Meals', 'Equipment', 'Software', 'Training', 'Other'];

const schema = z.object({
  title: z.string().min(2, 'Expense title is required'),
  employee: z.string().min(1, 'Employee is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than zero'),
  date: z.string().min(1, 'Expense date is required'),
  status: z.enum(STATUSES),
  notes: z.string().max(400).optional().or(z.literal('')),
});

const columns = [
  {
    accessorKey: 'title',
    header: 'Expense',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.title}</p>
        <p className="text-xs text-surface-400">{row.original.employeeName || row.original.employee}</p>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge color="orange">{getValue()}</Badge> },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => <span className="font-medium tabular-nums">{formatCurrency(getValue())}</span>,
  },
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip status={getValue() === 'REIMBURSED' ? 'PAID' : getValue()} />,
  },
];

export default function Expenses() {
  return (
    <ResourcePage
      title="Expenses"
      description="Employee expense claims and reimbursements."
      service={expenseService}
      queryKey="expenses"
      columns={columns}
      schema={schema}
      defaults={{ title: '', employee: '', category: 'Travel', amount: '', date: '', status: 'PENDING', notes: '' }}
      fields={[
        { name: 'title', label: 'Title', required: true, colSpan: 2, placeholder: 'e.g. Client visit — airfare' },
        { name: 'employee', label: 'Employee', required: true, placeholder: 'Employee email or ID' },
        { name: 'category', label: 'Category', type: 'select', native: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'date', label: 'Expense date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s })) },
        { name: 'notes', label: 'Notes / justification', type: 'textarea', colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'category', label: 'Category', options: CATEGORIES },
      ]}
      createLabel="Submit Expense"
    />
  );
}
