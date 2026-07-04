import { z } from 'zod';
import { courseService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Badge, { StatusChip } from '@/components/common/Badge';

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const CATEGORIES = ['Compliance', 'Technical', 'Leadership', 'Soft Skills', 'Product'];

const schema = z.object({
  title: z.string().min(3, 'Course title is required'),
  category: z.string().min(1, 'Category is required'),
  instructor: z.string().optional().or(z.literal('')),
  durationHours: z.coerce.number().min(0.5, 'At least 0.5 hours'),
  status: z.enum(STATUSES),
  description: z.string().max(1000).optional().or(z.literal('')),
});

const columns = [
  {
    accessorKey: 'title',
    header: 'Course',
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.title}</p>
        <p className="text-xs text-surface-400">{row.original.instructor || 'Self-paced'}</p>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge color="teal">{getValue()}</Badge> },
  {
    accessorKey: 'durationHours',
    header: 'Duration',
    cell: ({ getValue }) => (getValue() != null ? `${getValue()}h` : '—'),
  },
  { accessorKey: 'enrolled', header: 'Enrolled', cell: ({ getValue }) => getValue() ?? '—' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip status={getValue() === 'PUBLISHED' ? 'ACTIVE' : getValue()} />,
  },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => formatDate(getValue()) },
];

export default function Learning() {
  return (
    <ResourcePage
      title="Learning Management"
      description="Courses, training programs and enrollments."
      service={courseService}
      queryKey="courses"
      columns={columns}
      schema={schema}
      defaults={{ title: '', category: 'Technical', instructor: '', durationHours: 1, status: 'DRAFT', description: '' }}
      fields={[
        { name: 'title', label: 'Course title', required: true, colSpan: 2 },
        { name: 'category', label: 'Category', type: 'select', native: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        { name: 'instructor', label: 'Instructor' },
        { name: 'durationHours', label: 'Duration (hours)', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', native: true, options: STATUSES.map((s) => ({ value: s, label: s })) },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
      filters={[
        { key: 'status', label: 'Status', options: STATUSES },
        { key: 'category', label: 'Category', options: CATEGORIES },
      ]}
      createLabel="Add Course"
    />
  );
}
