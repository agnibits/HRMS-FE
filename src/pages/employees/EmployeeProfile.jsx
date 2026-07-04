import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiMail, FiPhone, FiCalendar, FiShield, FiClock, FiTrash2, FiRotateCcw, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS, PERMISSIONS } from '@/constants';
import { fullName, formatDate, formatDateTime, formatRelative, titleCase } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import Avatar from '@/components/common/Avatar';
import Badge, { StatusChip } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Tabs from '@/components/common/Tabs';
import Timeline from '@/components/common/Timeline';
import { PageLoader } from '@/components/common/Spinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useDisclosure } from '@/hooks/useDisclosure';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-surface-400" />
      <div className="min-w-0">
        <p className="text-xs text-surface-400">{label}</p>
        <p className="truncate text-sm font-medium text-surface-800 dark:text-surface-200">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const deleteModal = useDisclosure();
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

  const rolesMutation = useMutation({
    mutationFn: (roleIds) => userService.setRoles(id, roleIds),
    onSuccess: () => {
      toast.success('Roles updated');
      setPendingRoles(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.users] });
    },
    onError: (err) => toast.error(err.message),
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
  const allRoles = rolesQuery.data?.data || [];
  const assignedIds = new Set((pendingRoles ?? (user.roles || []).map((r) => r.id)));

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
          hasPermission(PERMISSIONS.USER_DELETE) && (
            <Button variant="danger" leftIcon={FiTrash2} onClick={() => deleteModal.open()}>
              Deactivate
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Identity card */}
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
              <InfoRow icon={FiMail} label="Email" value={user.email} />
              <InfoRow icon={FiPhone} label="Phone" value={user.phone} />
              <InfoRow icon={FiCalendar} label="Joined" value={formatDate(user.createdAt)} />
              <InfoRow icon={FiClock} label="Last active" value={formatRelative(user.lastLoginAt)} />
            </div>
          </CardBody>
        </Card>

        {/* Detail tabs */}
        <div className="lg:col-span-2">
          <Tabs
            tabs={[
              { key: 'overview', label: 'Overview' },
              ...(hasPermission(PERMISSIONS.USER_UPDATE) ? [{ key: 'roles', label: 'Roles & Access' }] : []),
              ...(hasPermission(PERMISSIONS.AUDIT_READ) ? [{ key: 'activity', label: 'Activity' }] : []),
            ]}
          >
            {(active) => (
              <>
                {active === 'overview' && (
                  <Card>
                    <CardHeader title="Account details" />
                    <CardBody className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                      <InfoRow icon={FiShield} label="Account status" value={titleCase(user.status)} />
                      <InfoRow
                        icon={user.mfaEnabled ? FiCheckCircle : FiXCircle}
                        label="Two-factor authentication"
                        value={user.mfaEnabled ? 'Enabled' : 'Not enabled'}
                      />
                      <InfoRow
                        icon={user.emailVerifiedAt ? FiCheckCircle : FiXCircle}
                        label="Email verified"
                        value={user.emailVerifiedAt ? formatDateTime(user.emailVerifiedAt) : 'Not verified'}
                      />
                      <InfoRow icon={FiClock} label="Last sign-in" value={formatDateTime(user.lastLoginAt)} />
                      <InfoRow icon={FiCalendar} label="Created" value={formatDateTime(user.createdAt)} />
                      <InfoRow icon={FiCalendar} label="Last updated" value={formatDateTime(user.updatedAt)} />
                    </CardBody>
                  </Card>
                )}

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
                      {allRoles.map((role) => (
                        <label
                          key={role.id}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 p-3.5 transition-colors hover:border-primary-300 dark:border-surface-700 dark:hover:border-primary-700"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 accent-primary-600"
                            checked={assignedIds.has(role.id)}
                            onChange={() => toggleRole(role.id)}
                          />
                          <span>
                            <span className="flex items-center gap-2 text-sm font-medium text-surface-900 dark:text-surface-100">
                              {role.name}
                              {role.isSystem && <Badge>System</Badge>}
                            </span>
                            {role.description && (
                              <span className="mt-0.5 block text-xs text-surface-400">{role.description}</span>
                            )}
                          </span>
                        </label>
                      ))}
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
                        <EmptyState title="No recorded activity" className="py-4" />
                      )}
                    </CardBody>
                  </Card>
                )}
              </>
            )}
          </Tabs>
        </div>
      </div>

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
