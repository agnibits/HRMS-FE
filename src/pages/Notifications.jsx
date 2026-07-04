import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuBell, LuCheck, LuCircleCheck, LuInfo, LuTriangleAlert } from 'react-icons/lu';
import { notificationService } from '@/services/modules';
import { request } from '@/api/client';
import { formatRelative } from '@/utils/formatters';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/cards/Card';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { SkeletonText } from '@/components/common/Skeleton';
import cn from '@/utils/cn';

const typeIcon = {
  INFO: { icon: LuInfo, cls: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400' },
  SUCCESS: { icon: LuCircleCheck, cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  WARNING: { icon: LuTriangleAlert, cls: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
};

export default function Notifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list({ limit: 50, sort: '-createdAt' }),
    retry: false,
  });

  const markRead = useMutation({
    mutationFn: (id) => request({ method: 'PATCH', url: `/notifications/${id}/read` }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err) => toast.error(err.message),
  });

  const markAllRead = useMutation({
    mutationFn: () => request({ method: 'POST', url: '/notifications/read-all' }),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => toast.error(err.message),
  });

  const items = query.data?.data || [];
  const unread = items.filter((n) => !n.readAt && !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}.` : 'You’re all caught up.'}
        actions={
          items.length > 0 && (
            <Button variant="secondary" size="sm" leftIcon={LuCheck} loading={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
              Mark all as read
            </Button>
          )
        }
      />

      <Card>
        {query.isLoading ? (
          <div className="p-6"><SkeletonText lines={6} /></div>
        ) : query.error ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={LuBell}
            title="No notifications"
            description="System alerts, approvals and mentions will show up here."
          />
        ) : (
          <ul className="divide-y divide-surface-100 dark:divide-surface-800">
            {items.map((n) => {
              const t = typeIcon[n.type] || typeIcon.INFO;
              const isUnread = !n.readAt && !n.isRead;
              return (
                <li
                  key={n.id}
                  className={cn('flex items-start gap-4 px-5 py-4', isUnread && 'bg-primary-50/40 dark:bg-primary-950/20')}
                >
                  <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full', t.cls)}>
                    <t.icon className="size-4.5" />
                  </span>
                  <div className="min-w-0 grow">
                    <p className={cn('text-sm text-surface-800 dark:text-surface-200', isUnread && 'font-semibold')}>
                      {n.title || n.message}
                    </p>
                    {n.title && n.message && (
                      <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{n.message}</p>
                    )}
                    <p className="mt-1 text-xs text-surface-400">{formatRelative(n.createdAt)}</p>
                  </div>
                  {isUnread && (
                    <Button variant="ghost" size="xs" onClick={() => markRead.mutate(n.id)}>
                      Mark read
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
