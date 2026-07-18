import { z } from 'zod';
import { departmentService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import { userRefField } from '@/components/forms/refFields';
import { useUserLookup } from '@/hooks/useUserLookup';
import ResourcePage from '@/components/common/ResourcePage';
import { StatusChip } from '@/components/common/Badge';

const schema = z.object({
  name: z.string().min(2, 'Department name is required'),
  code: z.string().min(1, 'Code is required').max(10),
  headId: z.string().optional().or(z.literal('')),
  description: z.string().max(300).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export default function Departments() {
  const { nameOf } = useUserLookup();

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
    {
      accessorKey: 'headName',
      header: 'Department Head',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.headName || row.original.headId
          ? nameOf(row.original.headName || row.original.headId)
          : <span className="text-surface-400">Unassigned</span>,
    },
    {
      accessorKey: 'employeeCount',
      header: 'Employees',
      cell: ({ getValue }) => <span className="font-medium">{getValue() ?? '—'}</span>,
    },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusChip status={getValue()} /> },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => formatDate(getValue()) },
  ];

  return (
    <ResourcePage
      title="Departments"
      description="Organize your workforce into functional units."
      service={departmentService}
      queryKey="departments"
      columns={columns}
      schema={schema}
      defaults={{ name: '', code: '', headId: '', description: '', status: 'ACTIVE' }}
      transformSubmit={(values) => {
        const payload = { ...values };
        if (!payload.headId) delete payload.headId;
        return payload;
      }}
      fields={[
        { name: 'name', label: 'Department name', required: true, placeholder: 'e.g. Engineering' },
        { name: 'code', label: 'Code', required: true, placeholder: 'ENG' },
        userRefField('headId', 'Department head', { hint: 'Optional — assign an employee once they exist.' }),
        { name: 'status', label: 'Status', type: 'select', native: true, options: [
          { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' },
        ] },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE'] }]}
    />
  );
}
