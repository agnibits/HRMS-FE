import { z } from 'zod';
import { FiDownload, FiFile } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { documentService } from '@/services/modules';
import { formatDate } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Badge from '@/components/common/Badge';

const CATEGORIES = ['Policy', 'Contract', 'Payslip', 'Certificate', 'ID Proof', 'Other'];

const schema = z.object({
  name: z.string().min(2, 'Document name is required'),
  category: z.string().min(1, 'Category is required'),
  owner: z.string().optional().or(z.literal('')),
  file: z.any().refine((f) => f instanceof File || f == null, 'Attach a file').optional(),
  notes: z.string().max(300).optional().or(z.literal('')),
});

const columns = [
  {
    accessorKey: 'name',
    header: 'Document',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <FiFile className="size-4 shrink-0 text-primary-500" />
        <div>
          <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.name}</p>
          <p className="text-xs text-surface-400">{row.original.fileName || ''}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge color="primary">{getValue()}</Badge> },
  { accessorKey: 'owner', header: 'Owner', cell: ({ getValue }) => getValue() || 'Company-wide' },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ getValue }) => (getValue() != null ? `${(getValue() / 1024).toFixed(0)} KB` : '—'),
  },
  { accessorKey: 'createdAt', header: 'Uploaded', cell: ({ getValue }) => formatDate(getValue()) },
];

export default function Documents() {
  return (
    <ResourcePage
      title="Documents"
      description="Company policies, contracts and employee files."
      service={documentService}
      queryKey="documents"
      columns={columns}
      schema={schema}
      defaults={{ name: '', category: 'Policy', owner: '', file: null, notes: '' }}
      fields={[
        { name: 'name', label: 'Document name', required: true, colSpan: 2 },
        { name: 'category', label: 'Category', type: 'select', native: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        { name: 'owner', label: 'Owner', placeholder: 'Employee email (blank = company-wide)' },
        { name: 'file', label: 'File', type: 'file', accept: '.pdf,.doc,.docx,.xlsx,.png,.jpg', colSpan: 2 },
        { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
      ]}
      transformSubmit={(values) => {
        // Multipart when a file is attached, plain JSON otherwise
        if (values.file instanceof File) {
          const form = new FormData();
          Object.entries(values).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') form.append(k, v);
          });
          return form;
        }
        const { file, ...rest } = values;
        return rest;
      }}
      filters={[{ key: 'category', label: 'Category', options: CATEGORIES }]}
      extraRowActions={(row) => [
        {
          icon: FiDownload,
          label: 'Download',
          onClick: () => {
            if (row.url) window.open(row.url, '_blank');
            else toast.error('No downloadable file attached to this document.');
          },
        },
      ]}
      createLabel="Upload Document"
    />
  );
}
