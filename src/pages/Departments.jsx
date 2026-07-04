import { z } from 'zod';
import { departmentService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';

const schema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(1, 'Code is required').max(10),
  head: z.string().optional().or(z.literal('')),
  description: z.string().max(300).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

const columns = [
  {
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.name}</p>
        <p className="text-xs text-surface-400">{row.original.code}</p>
      </div>
    ),
  },
  { accessorKey: 'head', header: 'Department Head', cell: ({ getValue }) => getValue() || '—' },
  {
    accessorKey: 'employeeCount',
    header: 'Employees',
    cell: ({ getValue }) => <span className="font-medium">{getValue() ?? '—'}</span>,
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => formatDate(getValue()) },
];

export default function Departments() {
  return (
    <ResourcePage
      title="Departments"
      description="Organize your workforce into functional units."
      service={departmentService}
      queryKey="departments"
      columns={columns}
      schema={schema}
      defaults={{ name: '', code: '', head: '', description: '', status: 'ACTIVE' }}
      fields={[
        { name: 'name', label: 'Department name', required: true, placeholder: 'e.g. Engineering' },
        { name: 'code', label: 'Code', required: true, placeholder: 'ENG' },
        { name: 'head', label: 'Department head', placeholder: 'Full name or email' },
        { name: 'status', label: 'Status', type: 'select', native: true, options: [
          { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE'] }]}
    />
  );
}
