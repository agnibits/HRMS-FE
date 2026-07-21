import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu';

import { useTableState } from '@/hooks/useTableState';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';
import DataTable from '@/components/tables/DataTable';
import Modal from '@/components/modals/Modal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import Button, { IconButton } from '@/components/common/Button';
import FilterSelect from '@/components/common/FilterSelect';
import FormShell from '@/components/forms/FormShell';
import FileUpload from '@/components/forms/FileUpload';
import RemoteFormSelect from '@/components/forms/RemoteFormSelect';
import {
  FormInput, FormPassword, FormTextarea, FormDate, FormCheckbox, FormSelect,
  FormNativeSelect, FormColor, FieldWrapper,
} from '@/components/forms/fields';

/**
 * Complete CRUD module page driven by configuration.
 *
 * Props:
 *  - title, description
 *  - service: createResourceService(...) instance
 *  - queryKey: string
 *  - columns: TanStack column defs (row actions are appended automatically)
 *  - schema: zod schema for create/edit
 *  - fields: [{ name, label, type, options?, required?, hint?, colSpan?, isMulti?, placeholder?, showOn? ('create'|'edit') }]
 *  - defaults: default form values for "create"
 *  - toEditValues(row): map a row to form values (defaults to picking field names)
 *  - filters: [{ key, label, options }]
 *  - permissions: { create?, update?, delete? } permission strings
 *  - onRowClick(row), extraRowActions(row): [{ icon, label, onClick }]
 *  - transformSubmit(values, editingRow): payload mapper
 *  - enableExportServer: use /export endpoint for Excel
 */
export function ResourcePage({
  title,
  description,
  service,
  queryKey,
  columns,
  schema,
  fields = [],
  defaults = {},
  toEditValues,
  filters = [],
  permissions = {},
  onRowClick,
  extraRowActions,
  transformSubmit = (v) => v,
  enableExportServer = false,
  searchPlaceholder,
  emptyDescription,
  createLabel,
  headerActions,
  disableEdit = false,
  disableDelete = false,
  disableCreate = false,
  hideHeader = false,
  beforeTable = null,
  initialFilters,
  initialSorting,
}) {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const tableState = useTableState({ filters: initialFilters, sorting: initialSorting });
  const formModal = useDisclosure();
  const deleteModal = useDisclosure();

  const listQuery = useQuery({
    queryKey: [queryKey, tableState.queryParams],
    queryFn: () => service.list(tableState.queryParams),
    keepPreviousData: true,
    retry: (count, err) => err?.status >= 500 && count < 2,
  });

  const rows = listQuery.data?.data || [];
  const pagination = listQuery.data?.meta?.pagination;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const editing = formModal.payload; // row being edited, or null for create

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaults,
  });

  const openCreate = () => {
    form.reset(defaults);
    formModal.open(null);
  };

  const openEdit = (row) => {
    const values = toEditValues
      ? toEditValues(row)
      : Object.fromEntries(
          fields.map((f) => {
            // Reference fields store as `<name>Id` on the row — prefill from that.
            const raw = row[f.name] ?? (f.type === 'remote' ? row[`${f.name}Id`] : undefined);
            return [f.name, raw ?? defaults[f.name] ?? ''];
          })
        );
    form.reset(values);
    formModal.open(row);
  };

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const payload = transformSubmit(values, editing);
      return editing ? service.update(editing.id, payload) : service.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? `${title.replace(/s$/, '')} updated` : `${title.replace(/s$/, '')} created`);
      formModal.close();
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (target) => {
      const items = Array.isArray(target) ? target : [target];
      for (const item of items) await service.remove(item.id);
      return items.length;
    },
    onSuccess: (count) => {
      toast.success(count > 1 ? `${count} records deleted` : 'Deleted successfully');
      deleteModal.close();
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const canCreate = !disableCreate && hasPermission(permissions.create);
  const canUpdate = !disableEdit && hasPermission(permissions.update);
  const canDelete = !disableDelete && hasPermission(permissions.delete);

  const allColumns = useMemo(() => {
    const hasActions = canUpdate || canDelete || extraRowActions;
    if (!hasActions) return columns;
    return [
      ...columns,
      {
        id: '__actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        size: 90,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {extraRowActions?.(row.original)?.map((a) => (
              <IconButton key={a.label} icon={a.icon} label={a.label} size="sm" onClick={() => a.onClick(row.original)} />
            ))}
            {canUpdate && (
              <IconButton icon={LuPencilLine} label="Edit" size="sm" onClick={() => openEdit(row.original)} />
            )}
            {canDelete && (
              <IconButton
                icon={LuTrash2}
                label="Delete"
                size="sm"
                className="hover:text-red-600 dark:hover:text-red-400"
                onClick={() => deleteModal.open(row.original)}
              />
            )}
          </div>
        ),
      },
    ];
  }, [columns, canUpdate, canDelete, extraRowActions]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderField = (f) => {
    if (f.showOn === 'create' && editing) return null;
    if (f.showOn === 'edit' && !editing) return null;
    const common = {
      key: f.name, form, name: f.name, label: f.label, required: f.required,
      hint: f.hint, placeholder: f.placeholder, className: f.colSpan === 2 ? 'sm:col-span-2' : undefined,
    };
    switch (f.type) {
      case 'textarea': return <FormTextarea {...common} />;
      case 'date': return <FormDate {...common} />;
      case 'password': return <FormPassword {...common} />;
      case 'checkbox': return <FormCheckbox {...common} />;
      case 'select':
        return f.native ? (
          <FormNativeSelect {...common} options={f.options || []} placeholder={f.placeholder || 'Select…'} />
        ) : (
          <FormSelect {...common} options={f.options || []} isMulti={false} />
        );
      case 'multiselect': return <FormSelect {...common} options={f.options || []} isMulti />;
      case 'remote':
        return (
          <RemoteFormSelect
            {...common}
            service={f.remote.service}
            params={f.remote.params}
            toOption={f.remote.toOption}
            isMulti={f.multiple}
            placeholder={f.placeholder || 'Search…'}
          />
        );
      case 'number': return <FormInput {...common} type="number" />;
      case 'color': return <FormColor {...common} />;
      case 'email': return <FormInput {...common} type="email" />;
      case 'time': return <FormInput {...common} type="time" />;
      case 'file':
        return (
          <FieldWrapper key={f.name} label={f.label} required={f.required} hint={f.hint} className={f.colSpan === 2 ? 'sm:col-span-2' : undefined}>
            <FileUpload
              value={form.watch(f.name) || null}
              onChange={(file) => form.setValue(f.name, file, { shouldValidate: true })}
              accept={f.accept}
              multiple={f.multiple}
            />
          </FieldWrapper>
        );
      default: return <FormInput {...common} type={f.type || 'text'} />;
    }
  };

  return (
    <div>
      {!hideHeader && (
        <PageHeader
          title={title}
          description={description}
          actions={
            <>
              {headerActions}
              {canCreate && (
                <Button leftIcon={LuPlus} onClick={openCreate}>
                  {createLabel || `Add ${title.replace(/s$/, '')}`}
                </Button>
              )}
            </>
          }
        />
      )}
      {hideHeader && canCreate && (
        <div className="mb-4 flex justify-end gap-2">
          {headerActions}
          <Button leftIcon={LuPlus} onClick={openCreate}>
            {createLabel || `Add ${title.replace(/s$/, '')}`}
          </Button>
        </div>
      )}

      {beforeTable}

      <DataTable
        title={title.toLowerCase().replace(/\s+/g, '-')}
        columns={allColumns}
        data={rows}
        pagination={pagination}
        tableState={tableState}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
        onRetry={() => listQuery.refetch()}
        searchPlaceholder={searchPlaceholder || `Search ${title.toLowerCase()}…`}
        enableSelection={canDelete}
        onRowClick={onRowClick}
        onExportExcel={enableExportServer ? () => service.exportExcel(tableState.queryParams) : undefined}
        bulkActions={
          canDelete
            ? [{ label: 'Delete selected', icon: LuTrash2, danger: true, onClick: (sel) => deleteModal.open(sel) }]
            : []
        }
        toolbar={filters.map((flt) => (
          <FilterSelect
            key={flt.key}
            label={flt.label}
            value={tableState.filters[flt.key]}
            onChange={(v) => tableState.setFilter(flt.key, v)}
            options={flt.options}
          />
        ))}
        empty={{
          title: `No ${title.toLowerCase()} yet`,
          description: emptyDescription || `Create your first record to get started.`,
          actionLabel: canCreate ? createLabel || `Add ${title.replace(/s$/, '')}` : undefined,
          onAction: canCreate ? openCreate : undefined,
        }}
      />

      {/* Create / edit modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={editing ? `Edit ${title.replace(/s$/, '')}` : `New ${title.replace(/s$/, '')}`}
        size={fields.length > 5 ? 'lg' : 'md'}
      >
        <FormShell
          form={form}
          onSubmit={(values) => saveMutation.mutate(values)}
          onCancel={formModal.close}
          loading={saveMutation.isPending}
          apiError={saveMutation.error}
          submitLabel={editing ? 'Save changes' : 'Create'}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map(renderField)}</div>
        </FormShell>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteMutation.mutate(deleteModal.payload)}
        loading={deleteMutation.isPending}
        title={Array.isArray(deleteModal.payload) ? `Delete ${deleteModal.payload.length} records?` : 'Delete record?'}
        message="This action cannot be undone. The selected record(s) will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

export default ResourcePage;
