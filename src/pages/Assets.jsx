import { z } from 'zod';
import { assetService } from '@/services/modules';
import { formatDate, formatCurrency } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Badge, { StatusChip } from '@/components/common/Badge';

const STATUSES = ['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED'];
const CATEGORIES = ['Laptop', 'Monitor', 'Phone', 'Furniture', 'Peripheral', 'Software License', 'Other'];

const schema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  tag: z.string().min(1, 'Asset tag is required'),
  category: z.string().min(1, 'Category is required'),
  assignedTo: z.string().optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  cost: z.coerce.number().min(0).optional(),
  status: z.enum(STATUSES),
});

const columns = [
  {
    accessorKey: 'name',
    header: 'Asset',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.name}</p>
        <p className="font-mono text-xs text-surface-400">{row.original.tag}</p>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge color="blue">{getValue()}</Badge> },
  { accessorKey: 'assignedTo', header: 'Assigned To', cell: ({ getValue }) => getValue() || <span className="text-surface-400">Unassigned</span> },
  { accessorKey: 'purchaseDate', header: 'Purchased', cell: ({ getValue }) => formatDate(getValue()) },
  { accessorKey: 'cost', header: 'Cost', cell: ({ getValue }) => (getValue() != null ? formatCurrency(getValue()) : '—') },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip status={getValue() === 'AVAILABLE' ? 'ACTIVE' : getValue() === 'IN_REPAIR' ? 'ON_HOLD' : getValue() === 'ASSIGNED' ? 'IN_PROGRESS' : getValue()} />,
  },
];

export default function Assets() {
  return (
    <ResourcePage
      title="Assets"
      description="Company equipment, assignments and lifecycle."
      service={assetService}
      queryKey="assets"
      columns={columns}
      schema={schema}
      defaults={{ name: '', tag: '', category: 'Laptop', assignedTo: '', purchaseDate: '', cost: '', status: 'AVAILABLE' }}
      fields={[
        { name: 'name', label: 'Asset name', required: true, placeholder: 'e.g. MacBook Pro 14"' },
        { name: 'tag', label: 'Asset tag', required: true, placeholder: 'e.g. AGN-LT-0042' },
        { name: 'category', label: 'Category', type: 'select', native: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        { name: 'assignedTo', label: 'Assigned to', placeholder: 'Employee email (optional)' },
        { name: 'purchaseDate', label: 'Purchase date', type: 'date' },
        { name: 'cost', label: 'Cost', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })) },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'category', label: 'Category', options: CATEGORIES },
      ]}
      createLabel="Add Asset"
    />
  );
}
