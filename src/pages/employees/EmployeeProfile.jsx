import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  LuMail, LuPhone, LuCalendarDays, LuShieldCheck, LuClock, LuCircleCheck, LuCircleX,
  LuEllipsisVertical, LuPencilLine, LuIdCard, LuUserRoundX, LuMailPlus,
  LuBuilding2, LuBriefcaseBusiness, LuUserRound, LuBadgeCheck,
} from 'react-icons/lu';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { auditService } from '@/services/auditService';
import { departmentService, designationService } from '@/services/modules';
import { request } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS, PERMISSIONS, USER_STATUSES, EMPLOYMENT_TYPES, isTenantRole } from '@/constants';
import { fullName, formatDate, formatDateTime, formatRelative, titleCase, truncate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import Avatar from '@/components/common/Avatar';
import Badge, { StatusChip } from '@/components/common/Badge';
import Button, { IconButton } from '@/components/common/Button';
import Dropdown from '@/components/common/Dropdown';
import Tabs from '@/components/common/Tabs';
import Timeline from '@/components/common/Timeline';
import { PageLoader } from '@/components/common/Spinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import FormShell from '@/components/forms/FormShell';
import { FormInput, FormNativeSelect, FormDate } from '@/components/forms/fields';
import RemoteFormSelect from '@/components/forms/RemoteFormSelect';
import LeaveBalanceCard from '@/components/leave/LeaveBalanceCard';
import { useDisclosure } from '@/hooks/useDisclosure';

function InfoRow({ icon: Icon, label, value, title }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-surface-400" />
      <div className="min-w-0">
        <p className="text-xs text-surface-400">{label}</p>
        <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-200" title={title}>
          {value || <span className="text-surface-400">—</span>}
        </p>
      </div>
    </div>
  );
}

const opt = z.string().optional().or(z.literal(''));
const editSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: opt,
  departmentId: opt,
  designationId: opt,
  managerId: opt,
  joiningDate: opt,
  employmentType: opt,
  status: z.enum(USER_STATUSES),
});

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const deleteModal = useDisclosure();
  const editModal = useDisclosure();
  const [pendingRoles, setPendingRoles] = useState(null);

  const userQuery = useQuery({
    queryKey: [QUERY_KEYS.users, id],
    queryFn: () => userService.get(id),
  });

  const rolesQuery = useQuery({
    queryKey: [QUERY_KEYS.roles, 'options'],
    queryFn: () => roleService.list({ limit: 100 }),
  });

  const activityQuery = useQuery({
    queryKey: [QUERY_KEYS.auditLogs, 'entity', id],
    queryFn: () => auditService.list({ limit: 20, sort: '-createdAt', entityId: id }),
    enabled: hasPermission(PERMISSIONS.AUDIT_READ),
  });

  const form = useForm({ resolver: zodResolver(editSchema) });

  const rolesMutation = useMutation({
    mutationFn: (roleIds) => userService.setRoles(id, roleIds),
    onSuccess: () => {
      toast.success('Roles updated');
      setPendingRoles(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
    onError: (err) => toast.error(err.message),
  });

  const editMutation = useMutation({
    mutationFn: (values) => {
      const payload = { ...values };
      ['phone', 'departmentId', 'designationId', 'managerId', 'joiningDate', 'employmentType'].forEach((k) => {
        if (!payload[k]) delete payload[k];
      });
      return userService.update(id, payload);
    },
    onSuccess: () => {
      toast.success('Employee updated');
      editModal.close();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
    onError: (err) => toast.error(err.message),
  });

  const resendInvite = useMutation({
    mutationFn: () => request({ method: 'POST', url: `/users/${id}/resend-invite` }),
    onSuccess: ({ data }) =>
      toast.success(`Invitation resent${data?.email ? ` to ${data.email}` : ''}.`),
    onError: (err) =>
      toast.error(
        err?.status === 404
          ? 'Resend invite isn’t available on the server yet.'
          : err.message
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.remove(id),
    onSuccess: () => {
      toast.success('Employee deactivated');
      navigate('/employees');
    },
    onError: (err) => toast.error(err.message),
  });

  if (userQuery.isLoading) return <PageLoader label="Loading employee…" />;
  if (userQuery.error) return <ErrorState error={userQuery.error} onRetry={() => userQuery.refetch()} />;

  const user = userQuery.data?.data;
  const allRoles = (rolesQuery.data?.data || []).filter(isTenantRole);
  const assignedIds = new Set((pendingRoles ?? (user.roles || []).map((r) => r.id)));
  const canUpdate = hasPermission(PERMISSIONS.USER_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USER_DELETE);

  const openEdit = () => {
    form.reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      departmentId: user.departmentId || '',
      designationId: user.designationId || '',
      managerId: user.managerId || '',
      joiningDate: user.joiningDate ? user.joiningDate.slice(0, 10) : '',
      employmentType: user.employmentType || '',
      status: user.status || 'ACTIVE',
    });
    editModal.open();
  };

  const toggleRole = (roleId) => {
    const next = new Set(assignedIds);
    next.has(roleId) ? next.delete(roleId) : next.add(roleId);
    setPendingRoles([...next]);
  };

  const activityItems = (activityQuery.data?.data || []).map((log) => ({
    id: log.id,
    title: `${titleCase(log.action)} · ${titleCase(log.entity)}`,
    description: log.ipAddress ? `from ${log.ipAddress}` : undefined,
    timestamp: log.createdAt,
    color: log.status === 'FAILURE' ? 'red' : 'green',
  }));

  return (
    <div>
      <PageHeader
        title={fullName(user)}
        breadcrumbItems={[
          { label: 'Employees', to: '/employees' },
          { label: fullName(user), to: `/employees/${id}` },
        ]}
        actions={
          <>
            {canUpdate && (
              <Button variant="secondary" leftIcon={LuPencilLine} onClick={openEdit}>
                Edit
              </Button>
            )}
            {(canUpdate || canDelete) && (
              <Dropdown
                align="right"
                width="w-56"
                trigger={<IconButton icon={LuEllipsisVertical} label="More actions" variant="secondary" />}
                items={[
                  ...(canUpdate
                    ? [{
                        key: 'resend',
                        label: 'Resend invitation',
                        icon: LuMailPlus,
                        onClick: () => resendInvite.mutate(),
                      }]
                    : []),
                  ...(canUpdate && canDelete ? [null] : []),
                  ...(canDelete
                    ? [{
                        key: 'deactivate',
                        label: 'Deactivate employee',
                        icon: LuUserRoundX,
                        danger: true,
                        onClick: () => deleteModal.open(),
                      }]
                    : []),
                ]}
              />
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Identity card — at-a-glance summary */}
        <Card className="h-fit">
          <CardBody className="flex flex-col items-center text-center">
            <Avatar name={user} src={user.avatarUrl} size="xl" />
            <h2 className="mt-3 text-lg font-bold text-surface-900 dark:text-surface-50">{fullName(user)}</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              <StatusChip status={user.status} />
              {(user.roles || []).map((r) => (
                <Badge key={r.id} color="primary">{r.name}</Badge>
              ))}
            </div>
            <div className="mt-6 w-full space-y-4 border-t border-surface-100 pt-5 text-left dark:border-surface-800">
              <InfoRow icon={LuMail} label="Email" value={user.email} />
              <InfoRow icon={LuPhone} label="Phone" value={user.phone} />
              <InfoRow icon={LuCalendarDays} label="Joined" value={formatDate(user.createdAt)} />
              {/* Single sign-in metric — relative here, exact on hover */}
              <InfoRow
                icon={LuClock}
                label="Last sign-in"
                value={user.lastLoginAt ? formatRelative(user.lastLoginAt) : 'Never signed in'}
                title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined}
              />
            </div>
          </CardBody>
        </Card>

        {/* Detail tabs */}
        <div className="min-w-0 lg:col-span-2">
          <Tabs
            tabs={[
              { key: 'overview', label: 'Overview' },
              { key: 'leave', label: 'Leave Balance' },
              ...(canUpdate ? [{ key: 'roles', label: 'Roles & Access' }] : []),
              ...(hasPermission(PERMISSIONS.AUDIT_READ) ? [{ key: 'activity', label: 'Activity' }] : []),
            ]}
          >
            {(active) => (
              <>
                {active === 'overview' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader title="Employment" description="Role and reporting details for this employee." />
                      <CardBody className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                        <InfoRow icon={LuIdCard} label="Employee ID" value={user.employeeId || truncate(user.id, 14)} title={user.id} />
                        <InfoRow icon={LuBuilding2} label="Department" value={user.departmentName} />
                        <InfoRow icon={LuBriefcaseBusiness} label="Designation" value={user.designationName} />
                        <InfoRow icon={LuUserRound} label="Reporting Manager" value={user.managerName} />
                        <InfoRow icon={LuCalendarDays} label="Joining date" value={user.joiningDate ? formatDate(user.joiningDate) : null} />
                        <InfoRow icon={LuBadgeCheck} label="Employment type" value={user.employmentType ? titleCase(user.employmentType) : null} />
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader title="Account & security" description="Authentication and account lifecycle." />
                      <CardBody className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                        <InfoRow
                          icon={user.mfaEnabled ? LuCircleCheck : LuCircleX}
                          label="Two-factor authentication"
                          value={user.mfaEnabled ? 'Enabled' : 'Not enabled'}
                        />
                        <InfoRow
                          icon={user.emailVerifiedAt ? LuCircleCheck : LuCircleX}
                          label="Email verified"
                          value={user.emailVerifiedAt ? formatDateTime(user.emailVerifiedAt) : 'Not verified'}
                        />
                        <InfoRow icon={LuShieldCheck} label="Created" value={formatDateTime(user.createdAt)} />
                        <InfoRow icon={LuClock} label="Last updated" value={formatDateTime(user.updatedAt)} />
                      </CardBody>
                    </Card>
                  </div>
                )}

                {active === 'leave' && <LeaveBalanceCard employeeId={id} />}

                {active === 'roles' && (
                  <Card>
                    <CardHeader
                      title="Assigned roles"
                      description="Roles control what this employee can see and do."
                      actions={
                        pendingRoles && (
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setPendingRoles(null)}>Discard</Button>
                            <Button size="sm" loading={rolesMutation.isPending} onClick={() => rolesMutation.mutate(pendingRoles)}>
                              Save roles
                            </Button>
                          </div>
                        )
                      }
                    />
                    <CardBody className="space-y-2.5">
                      {allRoles.map((role) => {
                        const perms = role.permissions || [];
                        const isOn = assignedIds.has(role.id);
                        return (
                          <label
                            key={role.id}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 p-3.5 transition-colors hover:border-primary-300 dark:border-surface-700 dark:hover:border-primary-700"
                          >
                            <input
                              type="checkbox"
                              className="mt-0.5 size-4 accent-primary-600"
                              checked={isOn}
                              onChange={() => toggleRole(role.id)}
                            />
                            <span className="min-w-0 grow">
                              <span className="flex items-center gap-2 text-sm font-medium text-surface-900 dark:text-surface-100">
                                {role.name}
                                {role.isSystem && <Badge>System</Badge>}
                              </span>
                              {role.description && (
                                <span className="mt-0.5 block text-xs text-surface-400">{role.description}</span>
                              )}
                              {/* What this role actually grants */}
                              {perms.length > 0 && (
                                <span className="mt-2 flex flex-wrap gap-1">
                                  {perms.slice(0, 6).map((p) => (
                                    <Badge key={p} color="primary" className="font-mono text-[10px]">{p}</Badge>
                                  ))}
                                  {perms.length > 6 && <Badge className="text-[10px]">+{perms.length - 6} more</Badge>}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </CardBody>
                  </Card>
                )}

                {active === 'activity' && (
                  <Card>
                    <CardHeader title="Recent activity" description="Audited events involving this employee" />
                    <CardBody>
                      {activityItems.length ? (
                        <Timeline items={activityItems} />
                      ) : (
                        <EmptyState
                          title="No recorded activity"
                          description="Account changes and sign-in events for this employee will appear here."
                          className="py-4"
                        />
                      )}
                    </CardBody>
                  </Card>
                )}
              </>
            )}
          </Tabs>
        </div>
      </div>

      {/* Edit employee */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit employee" size="md">
        <FormShell
          form={form}
          onSubmit={(v) => editMutation.mutate(v)}
          onCancel={editModal.close}
          loading={editMutation.isPending}
          apiError={editMutation.error}
          submitLabel="Save changes"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput form={form} name="firstName" label="First name" required />
            <FormInput form={form} name="lastName" label="Last name" required />
            <FormInput form={form} name="email" label="Email address" type="email" required className="sm:col-span-2" />
            <FormInput form={form} name="phone" label="Phone" placeholder="+1 555 000 0000" />
            <FormNativeSelect
              form={form}
              name="status"
              label="Status"
              options={USER_STATUSES.map((s) => ({ value: s, label: titleCase(s) }))}
            />
            <RemoteFormSelect
              form={form} name="departmentId" label="Department"
              service={departmentService} toOption={(d) => ({ value: d.id, label: d.name })}
            />
            <RemoteFormSelect
              form={form} name="designationId" label="Designation"
              service={designationService} toOption={(d) => ({ value: d.id, label: d.title })}
            />
            <RemoteFormSelect
              form={form} name="managerId" label="Reporting Manager"
              service={userService} toOption={(u) => ({ value: u.id, label: fullName(u) })}
            />
            <FormNativeSelect
              form={form} name="employmentType" label="Employment type" placeholder="Select…"
              options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: titleCase(t) }))}
            />
            <FormDate form={form} name="joiningDate" label="Joining date" className="sm:col-span-2" />
          </div>
        </FormShell>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        title="Deactivate employee?"
        message={`${fullName(user)} will be soft-deleted and lose access immediately. An administrator can restore the account later.`}
        confirmLabel="Deactivate"
      />
    </div>
  );
}
