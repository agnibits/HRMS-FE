import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { LuPencilLine, LuLock, LuPlus, LuShieldCheck, LuTrash2 } from 'react-icons/lu';
import { roleService } from '@/services/roleService';
import { useAuth } from '@/hooks/useAuth';
import { QUERY_KEYS, PERMISSIONS, isTenantRole } from '@/constants';
import { titleCase } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/cards/Card';
import Badge from '@/components/common/Badge';
import Button, { IconButton } from '@/components/common/Button';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { FormInput, FormTextarea } from '@/components/forms/fields';
import FormShell from '@/components/forms/FormShell';
import { CardSkeleton } from '@/components/common/Skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { useDisclosure } from '@/hooks/useDisclosure';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name is required').max(50),
  description: z.string().max(200).optional().or(z.literal('')),
});

export default function RolesPermissions() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
  const [selectedPerms, setSelectedPerms] = useState(new Set());

  const rolesQuery = useQuery({
    queryKey: [QUERY_KEYS.roles],
    queryFn: () => roleService.list({ limit: 100 }),
  });

  const catalogQuery = useQuery({
    queryKey: QUERY_KEYS.permissions,
    queryFn: () => roleService.permissions(),
  });

  // Hide platform-only roles (SUPER_ADMIN) — those belong to the vendor, not tenants.
  const roles = (rolesQuery.data?.data || []).filter(isTenantRole);
  // Backend shape: { wildcard, total, groups: { user: [{ key, permission, action }, ...], ... } }
  const catalog = useMemo(() => {
    const raw = catalogQuery.data?.data;
    if (!raw) return [];
    const groups = raw.groups || raw;
    const normalize = (perms) =>
      (perms || []).map((p) => (typeof p === 'string' ? p : p.permission)).filter(Boolean);
    if (Array.isArray(groups)) {
      return groups.map((g) => ({
        resource: g.resource || g.name,
        permissions: normalize(g.permissions || g.actions),
      }));
    }
    return Object.entries(groups).map(([resource, permissions]) => ({
      resource,
      permissions: normalize(permissions),
    }));
  }, [catalogQuery.data]);

  const editing = formModal.payload;
  const form = useForm({ resolver: zodResolver(roleSchema), defaultValues: { name: '', description: '' } });

  const openCreate = () => {
    form.reset({ name: '', description: '' });
    setSelectedPerms(new Set());
    formModal.open(null);
  };
  const openEdit = (role) => {
    form.reset({ name: role.name, description: role.description || '' });
    setSelectedPerms(new Set(role.permissions || []));
    formModal.open(role);
  };

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const payload = { ...values, permissions: [...selectedPerms] };
      if (!payload.description) delete payload.description;
      return editing ? roleService.update(editing.id, payload) : roleService.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Role updated' : 'Role created');
      formModal.close();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (role) => roleService.remove(role.id),
    onSuccess: () => {
      toast.success('Role deleted');
      deleteModal.close();
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roles] });
    },
    onError: (err) => toast.error(err.message),
  });

  const togglePerm = (perm) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  };

  const toggleGroup = (perms) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      const allOn = perms.every((p) => next.has(p));
      perms.forEach((p) => (allOn ? next.delete(p) : next.add(p)));
      return next;
    });
  };

  const canCreate = hasPermission(PERMISSIONS.ROLE_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.ROLE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLE_DELETE);

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Define what each role can access across your organization."
        actions={canCreate && <Button leftIcon={LuPlus} onClick={openCreate}>New Role</Button>}
      />

      {rolesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : rolesQuery.error ? (
        <ErrorState error={rolesQuery.error} onRetry={() => rolesQuery.refetch()} />
      ) : roles.length === 0 ? (
        <Card>
          <EmptyState
            icon={LuShieldCheck}
            title="No roles defined"
            description="Create your first role to start controlling access."
            actionLabel={canCreate ? 'New Role' : undefined}
            onAction={openCreate}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="flex flex-col">
              <CardBody className="flex grow flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                      {role.isSystem ? <LuLock className="size-4" /> : <LuShieldCheck className="size-4" />}
                    </span>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-surface-100">{role.name}</h3>
                      {role.isSystem && <Badge className="mt-0.5">System role</Badge>}
                    </div>
                  </div>
                  {!role.isSystem && (
                    <div className="flex gap-1">
                      {canUpdate && <IconButton icon={LuPencilLine} label="Edit role" size="sm" onClick={() => openEdit(role)} />}
                      {canDelete && (
                        <IconButton
                          icon={LuTrash2}
                          label="Delete role"
                          size="sm"
                          className="hover:text-red-600"
                          onClick={() => deleteModal.open(role)}
                        />
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-2.5 grow text-sm text-surface-500 dark:text-surface-400">
                  {role.description || 'No description provided.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(role.permissions || []).slice(0, 4).map((p) => (
                    <Badge key={p} color="primary" className="font-mono text-[10px]">{p}</Badge>
                  ))}
                  {(role.permissions || []).length > 4 && (
                    <Badge>+{role.permissions.length - 4} more</Badge>
                  )}
                  {role.isSystem && !(role.permissions || []).length && (
                    <Badge color="purple">All permissions</Badge>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create / edit role */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={editing ? `Edit role — ${editing.name}` : 'New role'}
        size="lg"
      >
        <FormShell
          form={form}
          onSubmit={(v) => saveMutation.mutate(v)}
          onCancel={formModal.close}
          loading={saveMutation.isPending}
          apiError={saveMutation.error}
          submitLabel={editing ? 'Save changes' : 'Create role'}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormInput form={form} name="name" label="Role name" required placeholder="e.g. HR Manager" />
            <FormTextarea form={form} name="description" label="Description" rows={2} placeholder="What is this role for?" />
          </div>

          <div>
            <p className="label-base mt-2">Permissions</p>
            {catalogQuery.isLoading ? (
              <p className="text-sm text-surface-400">Loading permission catalog…</p>
            ) : (
              <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border border-surface-200 p-4 dark:border-surface-700">
                {catalog.map((group) => {
                  const allOn = group.permissions.every((p) => selectedPerms.has(p));
                  return (
                    <div key={group.resource}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary-600"
                          checked={allOn}
                          onChange={() => toggleGroup(group.permissions)}
                        />
                        <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                          {titleCase(group.resource)}
                        </span>
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-1.5 pl-6 sm:grid-cols-2">
                        {group.permissions.map((perm) => (
                          <label key={perm} className="flex cursor-pointer items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                            <input
                              type="checkbox"
                              className="size-3.5 accent-primary-600"
                              checked={selectedPerms.has(perm)}
                              onChange={() => togglePerm(perm)}
                            />
                            <span className="font-mono text-xs">{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FormShell>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteMutation.mutate(deleteModal.payload)}
        loading={deleteMutation.isPending}
        title={`Delete role "${deleteModal.payload?.name}"?`}
        message="Deletion is blocked if the role is still assigned to any user. This cannot be undone."
        confirmLabel="Delete role"
      />
    </div>
  );
}
