import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LuUserRound, LuCalendarDays, LuHandshake, LuPlus, LuTrash2, LuListChecks,
} from 'react-icons/lu';
import { onboardingService } from '@/services/modules';
import { useUserLookup } from '@/hooks/useUserLookup';
import { formatDate } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import { StatusChip } from '@/components/common/Badge';
import Button, { IconButton } from '@/components/common/Button';
import { Input } from '@/components/forms/fields';
import { PageLoader } from '@/components/common/Spinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

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

export default function OnboardingDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { nameOf } = useUserLookup();
  const [newTask, setNewTask] = useState('');

  const query = useQuery({
    queryKey: ['onboarding', id],
    queryFn: () => onboardingService.get(id),
  });

  // Every task mutation returns the full onboarding — write it straight into the cache.
  const applyFresh = (res) => {
    if (res?.data) queryClient.setQueryData(['onboarding', id], { data: res.data });
    queryClient.invalidateQueries({ queryKey: ['onboarding'], exact: false });
  };

  const addTask = useMutation({
    mutationFn: (title) => onboardingService.addTask(id, title),
    onSuccess: (res) => { applyFresh(res); setNewTask(''); },
    onError: (err) => toast.error(err.message),
  });
  const toggleTask = useMutation({
    mutationFn: ({ taskId, done }) => onboardingService.updateTask(id, taskId, { done }),
    onSuccess: applyFresh,
    onError: (err) => toast.error(err.message),
  });
  const removeTask = useMutation({
    mutationFn: (taskId) => onboardingService.deleteTask(id, taskId),
    onSuccess: applyFresh,
    onError: (err) => toast.error(err.message),
  });

  if (query.isLoading) return <PageLoader label="Loading onboarding…" />;
  if (query.error) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const ob = query.data?.data || {};
  const tasks = ob.tasks || [];
  const done = ob.tasksDone ?? tasks.filter((t) => t.done).length;
  const total = ob.tasksTotal ?? tasks.length;
  const progress = ob.progress ?? (total ? Math.round((done / total) * 100) : 0);
  const hire = ob.employeeName || nameOf(ob.employeeId || ob.employee) || 'New hire';

  return (
    <div>
      <PageHeader
        title={hire}
        breadcrumbItems={[
          { label: 'Onboarding', to: '/onboarding' },
          { label: hire, to: `/onboarding/${id}` },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Summary */}
        <Card className="h-fit">
          <CardHeader title="Journey" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusChip status={ob.status} />
              <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
              <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-surface-400">{done} of {total} tasks complete</p>

            <div className="space-y-4 border-t border-surface-100 pt-4 dark:border-surface-800">
              <InfoRow icon={LuUserRound} label="Reporting Manager" value={ob.managerName} />
              <InfoRow icon={LuHandshake} label="Onboarding buddy" value={ob.buddyName || nameOf(ob.buddy)} />
              <InfoRow icon={LuCalendarDays} label="Start date" value={ob.startDate ? formatDate(ob.startDate) : null} />
            </div>
            {ob.notes && (
              <p className="rounded-lg bg-surface-50 p-3 text-sm text-surface-600 dark:bg-surface-850 dark:text-surface-300">
                {ob.notes}
              </p>
            )}
          </CardBody>
        </Card>

        {/* Checklist */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Onboarding checklist"
              description="Tick items as they’re completed — progress and status update automatically."
            />
            <CardBody>
              {tasks.length === 0 ? (
                <EmptyState icon={LuListChecks} title="No tasks yet" description="Add the first checklist item below." className="py-6" />
              ) : (
                <ul className="space-y-1.5">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="group flex items-center gap-3 rounded-lg border border-surface-200 px-3.5 py-2.5 transition-colors hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600"
                    >
                      <input
                        type="checkbox"
                        className="size-4.5 shrink-0 rounded border-surface-300 accent-primary-600"
                        checked={!!t.done}
                        disabled={toggleTask.isPending}
                        onChange={() => toggleTask.mutate({ taskId: t.id, done: !t.done })}
                      />
                      <span
                        className={`grow text-sm ${
                          t.done
                            ? 'text-surface-400 line-through'
                            : 'text-surface-800 dark:text-surface-100'
                        }`}
                      >
                        {t.title}
                      </span>
                      <IconButton
                        icon={LuTrash2}
                        label="Delete task"
                        size="sm"
                        className="opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                        onClick={() => removeTask.mutate(t.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {/* Add task */}
              <form
                onSubmit={(e) => { e.preventDefault(); if (newTask.trim()) addTask.mutate(newTask.trim()); }}
                className="mt-4 flex gap-2"
              >
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a checklist item…"
                />
                <Button type="submit" leftIcon={LuPlus} loading={addTask.isPending} disabled={!newTask.trim()}>
                  Add
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
