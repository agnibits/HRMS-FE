import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { holidayService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Calendar from '@/components/common/Calendar';
import Badge from '@/components/common/Badge';

const TYPES = ['PUBLIC', 'COMPANY', 'OPTIONAL'];
const typeColor = { PUBLIC: 'green', COMPANY: 'primary', OPTIONAL: 'amber' };
const calendarColor = { PUBLIC: 'green', COMPANY: 'primary', OPTIONAL: 'amber' };

const schema = z.object({
  name: z.string().min(2, 'Holiday name is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(TYPES),
  description: z.string().max(300).optional().or(z.literal('')),
});

const columns = [
  {
    accessorKey: 'name',
    header: 'Holiday',
    cell: ({ getValue }) => <span className="font-medium text-surface-900 dark:text-surface-100">{getValue()}</span>,
  },
  { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue(), 'ddd, MMM D, YYYY') },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => <Badge color={typeColor[getValue()] || 'gray'}>{getValue()}</Badge>,
  },
  { accessorKey: 'description', header: 'Notes', cell: ({ getValue }) => getValue() || '—' },
];

export default function Holidays() {
  const calendarQuery = useQuery({
    queryKey: ['holidays', 'calendar'],
    queryFn: () => holidayService.list({ limit: 200 }),
    retry: false,
  });

  const events = (calendarQuery.data?.data || []).map((h) => ({
    date: h.date,
    label: h.name,
    color: calendarColor[h.type] || 'primary',
  }));

  return (
    <ResourcePage
      title="Holiday Calendar"
      description="Company-wide public and optional holidays."
      service={holidayService}
      queryKey="holidays"
      columns={columns}
      schema={schema}
      defaults={{ name: '', date: '', type: 'PUBLIC', description: '' }}
      fields={[
        { name: 'name', label: 'Holiday name', required: true, placeholder: 'e.g. Independence Day' },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'type', label: 'Type', type: 'select', native: true, options: TYPES.map((t) => ({ value: t, label: t })) },
        { name: 'description', label: 'Notes', type: 'textarea', colSpan: 2 },
      ]}
      filters={[{ key: 'type', label: 'Type', options: TYPES }]}
      createLabel="Add Holiday"
      beforeTable={
        events.length > 0 ? <Calendar events={events} className="mb-6" /> : null
      }
    />
  );
}
