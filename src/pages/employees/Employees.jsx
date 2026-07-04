import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LuUpload } from 'react-icons/lu';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { USER_STATUSES, PERMISSIONS, QUERY_KEYS } from '@/constants';
import { fullName, formatDate, formatRelative } from '@/utils/formatters';
import ResourcePage from '@/components/common/ResourcePage';
import Avatar from '@/components/common/Avatar';
import { StatusChip } from '@/components/common/Badge';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/modals/Modal';
import FileUpload from '@/components/forms/FileUpload';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional().or(z.literal('')),
  password: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length >= 8, 'Password must be at least 8 characters'),
  status: z.enum(USER_STATUSES),
  roleIds: z.array(z.string()).optional(),
  sendWelcomeEmail: z.boolean().optional(),
});

const columns = [
  {
    accessorKey: 'firstName',
    header: 'Employee',
    meta: { exportHeader: 'Name', exportValue: (r) => fullName(r) },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original} src={row.original.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-surface-900 dark:text-surface-100">{fullName(row.original)}</p>
          <p className="truncate text-xs text-surface-400">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    enableSorting: false,
    meta: { exportValue: (r) => (r.roles || []).map((x) => x.name).join(', ') },
    cell: ({ getValue }) => {
      const roles = getValue() || [];
      return roles.length ? (
        <div className="flex flex-wrap gap-1">
          {roles.slice(0, 2).map((r) => (
            <Badge key={r.id} color="primary">{r.name}</Badge>
          ))}
          {roles.length > 2 && <Badge>+{roles.length - 2}</Badge>}
        </div>
      ) : (
        <span className="text-surface-400">—</span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <StatusChip status={getValue()} />,
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Active',
    meta: { exportValue: (r) => r.lastLoginAt || '' },
    cell: ({ getValue }) => <span className="text-surface-500 dark:text-surface-400">{formatRelative(getValue())}</span>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    meta: { exportValue: (r) => r.createdAt },
    cell: ({ getValue }) => formatDate(getValue()),
  },
];

export default function Employees() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const rolesQuery = useQuery({
    queryKey: [QUERY_KEYS.roles, 'options'],
    queryFn: () => roleService.list({ limit: 100 }),
  });
  const roleOptions = (rolesQuery.data?.data || []).map((r) => ({ value: r.id, label: r.name }));

  const importMutation = useMutation({
    mutationFn: () => userService.importFile(importFile),
    onSuccess: ({ data }) => {
      setImportResult(data);
      setImportFile(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
      toast.success(`Imported ${data?.created ?? 0} of ${data?.total ?? 0} users`);
    },
    onError: (err) => toast.error(err.message),
  });

  const fields = [
    { name: 'firstName', label: 'First name', required: true },
    { name: 'lastName', label: 'Last name', required: true },
    { name: 'email', label: 'Email address', type: 'email', required: true },
    { name: 'phone', label: 'Phone', placeholder: '+1 555 000 0000' },
    { name: 'roleIds', label: 'Roles', type: 'multiselect', options: roleOptions, colSpan: 2 },
    { name: 'status', label: 'Status', type: 'select', native: true, options: USER_STATUSES.map((s) => ({ value: s, label: s })) },
    {
      name: 'password', label: 'Password', type: 'password', showOn: 'create',
      hint: 'Leave blank to auto-generate and email a temporary password.',
    },
    { name: 'sendWelcomeEmail', label: 'Send welcome email with sign-in instructions', type: 'checkbox', showOn: 'create', colSpan: 2 },
  ];

  return (
    <>
      <ResourcePage
        title="Employees"
        description="Manage workforce accounts, roles and access."
        service={userService}
        queryKey={QUERY_KEYS.users}
        columns={columns}
        schema={userSchema}
        fields={fields}
        defaults={{
          firstName: '', lastName: '', email: '', phone: '',
          status: 'ACTIVE', roleIds: [], password: '', sendWelcomeEmail: true,
        }}
        toEditValues={(row) => ({
          firstName: row.firstName || '',
          lastName: row.lastName || '',
          email: row.email || '',
          phone: row.phone || '',
          status: row.status || 'ACTIVE',
          roleIds: (row.roles || []).map((r) => r.id),
          password: '',
          sendWelcomeEmail: false,
        })}
        transformSubmit={(values, editing) => {
          const payload = { ...values };
          if (!payload.password) delete payload.password;
          if (!payload.phone) delete payload.phone;
          if (editing) delete payload.sendWelcomeEmail;
          return payload;
        }}
        filters={[
          { key: 'status', label: 'Status', options: USER_STATUSES },
          { key: 'roleId', label: 'Role', options: roleOptions },
        ]}
        permissions={{
          create: PERMISSIONS.USER_CREATE,
          update: PERMISSIONS.USER_UPDATE,
          delete: PERMISSIONS.USER_DELETE,
        }}
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
        enableExportServer
        searchPlaceholder="Search by name or email…"
        createLabel="Add Employee"
        headerActions={
          <Button variant="secondary" leftIcon={LuUpload} onClick={() => { setImportResult(null); setImportOpen(true); }}>
            Import
          </Button>
        }
      />

      {/* Bulk import */}
      <Modal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import employees"
        description="Upload an Excel (.xlsx) or CSV file with columns: email, firstName, lastName, phone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportOpen(false)}>Close</Button>
            <Button onClick={() => importMutation.mutate()} disabled={!importFile} loading={importMutation.isPending}>
              Import file
            </Button>
          </>
        }
      >
        <FileUpload
          value={importFile}
          onChange={setImportFile}
          accept=".xlsx,.xls,.csv"
          maxSizeMb={5}
          label="Drop your spreadsheet here"
        />
        {importResult && (
          <div className="mt-4 rounded-lg border border-surface-200 bg-surface-50 p-4 text-sm dark:border-surface-700 dark:bg-surface-800">
            <p className="font-medium text-surface-800 dark:text-surface-100">
              {importResult.created} created · {importResult.skipped} skipped · {importResult.total} total
            </p>
            {importResult.errors?.length > 0 && (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-red-600 dark:text-red-400">
                {importResult.errors.map((e, i) => (
                  <li key={i}>Row {e.row}: {e.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
