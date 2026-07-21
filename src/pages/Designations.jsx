import { z } from 'zod';
import { designationService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import { departmentField } from '@/components/forms/refFields';
import ResourcePage from '@/components/common/ResourcePage';
import Badge from '@/components/common/Badge';

const LEVELS = [
  { value: 1, label: 'L1 – Intern / Trainee' },
  { value: 3, label: 'L3 – Junior' },
  { value: 5, label: 'L5 – Mid / Senior' },
  { value: 7, label: 'L7 – Lead' },
  { value: 9, label: 'L9 – Manager' },
  { value: 11, label: 'L11 – Senior Manager' },
  { value: 13, label: 'L13 – Director' },
  { value: 15, label: 'L15 – Executive / C-level' },
];

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  departmentId: z.string().optional().or(z.literal('')),
  level: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(1).max(15).optional()
  ),
  description: z.string().max(300).optional().or(z.literal('')),
});

const columns = [
  {
    accessorKey: 'title',
    header: 'Designation',
    cell: ({ getValue }) => <span className="font-medium text-surface-900 dark:text-surface-100">{getValue()}</span>,
  },
  {
    accessorKey: 'departmentName',
    header: 'Department',
    enableSorting: false,
    cell: ({ row }) => row.original.departmentName || <span className="text-surface-400">—</span>,
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ getValue }) => (getValue() ? <Badge color="primary">L{getValue()}</Badge> : <span className="text-surface-400">—</span>),
  },
  { accessorKey: 'employeeCount', header: 'Employees', cell: ({ getValue }) => getValue() ?? '—' },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => formatDate(getValue()) },
];

export default function Designations() {
  return (
    <ResourcePage
      title="Designations"
      description="Job titles and seniority levels across the organization."
      service={designationService}
      queryKey="designations"
      columns={columns}
      schema={schema}
      defaults={{ title: '', departmentId: '', level: '', description: '' }}
      transformSubmit={(values) => {
        const payload = { ...values };
        if (!payload.departmentId) delete payload.departmentId;
        if (!payload.level) delete payload.level;
        else payload.level = Number(payload.level);
        return payload;
      }}
      fields={[
        { name: 'title', label: 'Title', required: true, placeholder: 'e.g. Senior Software Engineer' },
        departmentField({ hint: 'Optional — groups this title under a department. Each employee’s own department is set on their profile.' }),
        { name: 'level', label: 'Level', type: 'select', native: true, placeholder: 'Select level…', options: LEVELS, hint: 'Optional — seniority band.' },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
    />
  );
}
