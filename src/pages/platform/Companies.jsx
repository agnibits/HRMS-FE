import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  LuPlus, LuBuilding2, LuCopy, LuCheck, LuRefreshCw, LuPause, LuPlay, LuShieldAlert,
} from 'react-icons/lu';
import { companyService } from '@/services/modules';
import { useAuth } from '@/hooks/useAuth';
import { useTableState } from '@/hooks/useTableState';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import Button, { IconButton } from '@/components/common/Button';
import Badge, { StatusChip } from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import FilterSelect from '@/components/common/FilterSelect';
import FormShell from '@/components/forms/FormShell';
import { FormInput, FormNativeSelect, FieldWrapper, Input } from '@/components/forms/fields';

const PLANS = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
const PLAN_COLORS = { FREE: 'gray', STARTER: 'blue', PRO: 'primary', ENTERPRISE: 'purple' };

/** Strong, readable temp password (crypto-random, no ambiguous chars). */
function genPassword() {
  const U = 'ABCDEFGHJKLMNPQRSTUVWXYZ', L = 'abcdefghijkmnpqrstuvwxyz', N = '23456789', S = '!@#$%&';
  const all = U + L + N + S;
  const pick = (set) => set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];
  let p = pick(U) + pick(L) + pick(N) + pick(S);
  for (let i = 0; i < 8; i++) p += pick(all);
  return p.split('').sort(() => (crypto.getRandomValues(new Uint32Array(1))[0] % 2 ? 1 : -1)).join('');
}

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required').max(80),
  plan: z.enum(PLANS),
  adminFirstName: z.string().min(1, 'Required'),
  adminLastName: z.string().min(1, 'Required'),
  adminEmail: z.string().min(1, 'Admin email is required').email('Enter a valid email'),
  adminPassword: z.string().min(8, 'At least 8 characters'),
});

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-surface-400">{label}</span>
      <code className="grow truncate rounded-lg bg-surface-100 px-2.5 py-1.5 text-sm dark:bg-surface-800">{value}</code>
      <IconButton
        icon={copied ? LuCheck : LuCopy}
        label="Copy"
        size="sm"
        className={copied ? 'text-emerald-600' : ''}
        onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      />
    </div>
  );
}

export default function Companies() {
  const { isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const tableState = useTableState({ sorting: [{ id: 'createdAt', desc: true }] });
  const createModal = useDisclosure();
  const statusModal = useDisclosure();
  const [credentials, setCredentials] = useState(null);
  const loginUrl = window.location.origin;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { companyName: '', plan: 'FREE', adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: genPassword() },
  });

  const listQuery = useQuery({
    queryKey: ['companies', tableState.queryParams],
    queryFn: () => companyService.list(tableState.queryParams),
    enabled: isSuperAdmin,
    keepPreviousData: true,
  });

  const provision = useMutation({
    mutationFn: (v) =>
      companyService.create({
        name: v.companyName,
        plan: v.plan,
        admin: {
          firstName: v.adminFirstName,
          lastName: v.adminLastName,
          email: v.adminEmail,
          password: v.adminPassword,
        },
      }),
    onSuccess: (_res, v) => {
      createModal.close();
      setCredentials({ company: v.companyName, email: v.adminEmail, password: v.adminPassword });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created');
    },
    onError: (err) =>
      toast.error(
        err?.status === 409 ? 'A company or admin with that email already exists.'
          : err?.status === 404 ? 'Company provisioning isn’t enabled on the server yet.'
          : err?.message || 'Could not create the company.'
      ),
  });

  const toggleStatus = useMutation({
    mutationFn: (row) =>
      companyService.update(row.id, { status: row.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }),
    onSuccess: () => {
      toast.success('Company status updated');
      statusModal.close();
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreate = () => {
    form.reset({ companyName: '', plan: 'FREE', adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: genPassword() });
    createModal.open();
  };

  if (!isSuperAdmin) {
    return (
      <div>
        <PageHeader title="Companies" breadcrumb={false} />
        <div className="card">
          <EmptyState icon={LuShieldAlert} title="Restricted" description="Only platform super-admins can manage companies." />
        </div>
      </div>
    );
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Company',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
            <LuBuilding2 className="size-4.5" />
          </span>
          <div>
            <p className="font-medium text-surface-900 dark:text-surface-100">{row.original.name}</p>
            <p className="text-xs text-surface-400">{row.original.adminEmail || row.original.ownerEmail || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'plan',
      header: 'Plan',
      cell: ({ getValue }) => <Badge color={PLAN_COLORS[getValue()] || 'gray'}>{getValue() || 'FREE'}</Badge>,
    },
    { accessorKey: 'employeeCount', header: 'Employees', cell: ({ getValue }) => getValue() ?? '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusChip status={getValue() || 'ACTIVE'} />,
    },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ getValue }) => formatDate(getValue()) },
    {
      id: '__actions',
      header: '',
      enableSorting: false,
      size: 60,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <IconButton
            icon={row.original.status === 'ACTIVE' ? LuPause : LuPlay}
            label={row.original.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            size="sm"
            onClick={() => statusModal.open(row.original)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Provision and manage tenant companies on the Agnibits platform."
        actions={<Button leftIcon={LuPlus} onClick={openCreate}>New Company</Button>}
      />

      <DataTable
        title="companies"
        columns={columns}
        data={listQuery.data?.data || []}
        pagination={listQuery.data?.meta?.pagination}
        tableState={tableState}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
        onRetry={() => listQuery.refetch()}
        searchPlaceholder="Search companies…"
        toolbar={
          <>
            <FilterSelect label="Plan" value={tableState.filters.plan} onChange={(v) => tableState.setFilter('plan', v)} options={PLANS} />
            <FilterSelect label="Status" value={tableState.filters.status} onChange={(v) => tableState.setFilter('status', v)} options={['ACTIVE', 'SUSPENDED']} />
          </>
        }
        empty={{
          title: 'No companies yet',
          description: 'Provision your first customer company to get started.',
          actionLabel: 'New Company',
          onAction: openCreate,
        }}
      />

      {/* Provision company + admin */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="New company" description="Creates the company workspace and its first admin. You'll get credentials to hand over." size="lg">
        <FormShell
          form={form}
          onSubmit={(v) => provision.mutate(v)}
          onCancel={createModal.close}
          loading={provision.isPending}
          apiError={provision.error?.status !== 404 ? provision.error : undefined}
          submitLabel="Create company"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput form={form} name="companyName" label="Company name" required placeholder="Acme Inc." className="sm:col-span-2" />
            <FormNativeSelect form={form} name="plan" label="Plan" options={PLANS.map((p) => ({ value: p, label: p }))} className="sm:col-span-2" />
            <FormInput form={form} name="adminFirstName" label="Admin first name" required />
            <FormInput form={form} name="adminLastName" label="Admin last name" required />
            <FormInput form={form} name="adminEmail" label="Admin email" type="email" required className="sm:col-span-2" hint="The customer signs in with this email." />
            <FieldWrapper
              label="Temporary password"
              required
              error={form.formState.errors.adminPassword?.message}
              className="sm:col-span-2"
            >
              <div className="flex gap-2">
                <Input {...form.register('adminPassword')} className="font-mono" />
                <Button variant="secondary" leftIcon={LuRefreshCw} onClick={() => form.setValue('adminPassword', genPassword(), { shouldValidate: true })}>
                  Generate
                </Button>
              </div>
            </FieldWrapper>
          </div>
        </FormShell>
      </Modal>

      {/* Credentials reveal */}
      <Modal
        isOpen={!!credentials}
        onClose={() => setCredentials(null)}
        title="Company created 🎉"
        description="Share these credentials with the customer. The password won't be shown again."
        size="md"
        footer={
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `Agnibits HRMS\nLogin: ${loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`
              );
              toast.success('All credentials copied');
            }}
            leftIcon={LuCopy}
          >
            Copy all
          </Button>
        }
      >
        {credentials && (
          <div className="space-y-3">
            <p className="text-sm text-surface-600 dark:text-surface-300">
              Workspace for <span className="font-semibold">{credentials.company}</span> is ready.
            </p>
            <div className="space-y-2.5 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-850">
              <CopyRow label="Login URL" value={loginUrl} />
              <CopyRow label="Email" value={credentials.email} />
              <CopyRow label="Password" value={credentials.password} />
            </div>
            <p className="text-xs text-surface-400">
              Tip: ask the customer to change their password after first sign-in (Profile → Change Password).
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        onConfirm={() => toggleStatus.mutate(statusModal.payload)}
        loading={toggleStatus.isPending}
        variant={statusModal.payload?.status === 'ACTIVE' ? 'danger' : 'primary'}
        title={statusModal.payload?.status === 'ACTIVE' ? 'Suspend company?' : 'Activate company?'}
        message={
          statusModal.payload?.status === 'ACTIVE'
            ? `${statusModal.payload?.name}'s users will lose access until reactivated.`
            : `${statusModal.payload?.name}'s users will regain access.`
        }
        confirmLabel={statusModal.payload?.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
      />
    </div>
  );
}
