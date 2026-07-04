import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { LuCalendarDays, LuCircleCheck, LuHourglass, LuGauge } from 'react-icons/lu';
import { leaveService } from '@/services/modules';
import { userService } from '@/services/userService';
import { LEAVE_POLICY, TRACKED_LEAVE_TYPES, PAID_ENTITLEMENT } from '@/constants/leavePolicy';
import { fullName } from '@/utils/formatters';
import StatCard from '@/components/cards/StatCard';
import { DonutChart } from '@/components/charts/Charts';
import { Card, CardHeader } from '@/components/cards/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

/**
 * Client-side leave-balance engine.
 * For the current year, accrues each employee's APPROVED leave (used) and
 * PENDING leave against the company policy entitlement, per tracked type.
 * Runs entirely on the frontend today; drops in behind a server endpoint later.
 */
function computeBalances(users, leaves) {
  const year = dayjs().year();

  const byEmployee = {};
  leaves.forEach((l) => {
    if (!l.startDate || dayjs(l.startDate).year() !== year) return;
    const key = l.employeeId ?? l.employee;
    if (!key) return;
    (byEmployee[key] = byEmployee[key] || []).push(l);
  });

  const daysOf = (l) =>
    l.days ?? (l.endDate ? dayjs(l.endDate).diff(dayjs(l.startDate), 'day') + 1 : 0);

  return users.map((u) => {
    const rows = [...(byEmployee[u.id] || []), ...(byEmployee[u.email] || [])];
    const types = {};
    TRACKED_LEAVE_TYPES.forEach((t) => {
      types[t.key] = { used: 0, pending: 0, entitlement: LEAVE_POLICY[t.key] || 0 };
    });

    rows.forEach((l) => {
      const t = types[l.type];
      if (!t) return;
      const d = daysOf(l);
      if (l.status === 'APPROVED') t.used += d;
      else if (l.status === 'PENDING') t.pending += d;
    });

    const used = TRACKED_LEAVE_TYPES.reduce((s, t) => s + types[t.key].used, 0);
    const pending = TRACKED_LEAVE_TYPES.reduce((s, t) => s + types[t.key].pending, 0);
    return { user: u, types, entitlement: PAID_ENTITLEMENT, used, pending, remaining: PAID_ENTITLEMENT - used };
  });
}

/** used / total meter for one leave type. */
function Meter({ used, total, tone }) {
  const pct = total ? Math.min(100, (used / total) * 100) : 0;
  const over = used > total;
  const bar = {
    blue: 'bg-sky-500', red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-emerald-500',
  }[tone] || 'bg-primary-600';
  return (
    <div className="min-w-28">
      <div className="flex items-baseline justify-between text-xs">
        <span className={`font-semibold tabular-nums ${over ? 'text-red-600 dark:text-red-400' : 'text-surface-800 dark:text-surface-200'}`}>
          {used}<span className="text-surface-400">/{total}</span>
        </span>
        <span className="text-surface-400">{Math.max(0, total - used)} left</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
        <div className={`h-full rounded-full ${over ? 'bg-red-500' : bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function LeaveBalances() {
  const usersQuery = useQuery({
    queryKey: ['users', 'leave-balance'],
    queryFn: () => userService.list({ limit: 100, status: 'ACTIVE' }),
  });
  const leavesQuery = useQuery({
    queryKey: ['leaves', 'all-for-balance'],
    queryFn: () => leaveService.list({ limit: 200 }),
    retry: false,
  });

  const balances = useMemo(
    () => computeBalances(usersQuery.data?.data || [], leavesQuery.data?.data || []),
    [usersQuery.data, leavesQuery.data]
  );

  const summary = useMemo(() => {
    const totalEntitlement = balances.reduce((s, b) => s + b.entitlement, 0);
    const totalUsed = balances.reduce((s, b) => s + b.used, 0);
    const totalPending = balances.reduce((s, b) => s + b.pending, 0);
    return {
      employees: balances.length,
      totalUsed,
      totalPending,
      utilization: totalEntitlement ? Math.round((totalUsed / totalEntitlement) * 100) : 0,
    };
  }, [balances]);

  const usageByType = useMemo(
    () =>
      TRACKED_LEAVE_TYPES.map((t) => ({
        name: t.label,
        tone: t.tone,
        value: balances.reduce((s, b) => s + b.types[t.key].used, 0),
      })).filter((d) => d.value > 0),
    [balances]
  );

  const isLoading = usersQuery.isLoading || leavesQuery.isLoading;
  const error = usersQuery.error || (leavesQuery.error?.status !== 404 ? leavesQuery.error : null);

  if (error) return <ErrorState error={error} onRetry={() => { usersQuery.refetch(); leavesQuery.refetch(); }} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Employees" value={summary.employees} icon={LuCalendarDays} accent="primary" loading={isLoading} />
        <StatCard label="Days Used (approved)" value={summary.totalUsed} icon={LuCircleCheck} accent="green" loading={isLoading} />
        <StatCard label="Pending Approval" value={summary.totalPending} icon={LuHourglass} accent="amber" loading={isLoading} />
        <StatCard label="Utilization" value={`${summary.utilization}%`} icon={LuGauge} accent="violet" loading={isLoading} deltaLabel={`of ${PAID_ENTITLEMENT} days/employee`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DonutChart
          title="Leave usage by type"
          description={`Approved days this year · policy: ${TRACKED_LEAVE_TYPES.map((t) => `${t.label} ${LEAVE_POLICY[t.key]}`).join(' · ')}`}
          data={usageByType}
          loading={isLoading}
        />

        <Card className="xl:col-span-2">
          <CardHeader
            title="Balance by employee"
            description="Approved leave accrued against the annual policy entitlement."
          />
          {isLoading ? (
            <TableSkeleton cols={5} rows={6} />
          ) : balances.length === 0 ? (
            <EmptyState title="No employees to show" className="py-8" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b border-surface-200/80 bg-surface-50/80 text-xs font-medium text-surface-500 dark:border-surface-800/80 dark:bg-surface-850/60 dark:text-surface-400">
                    <th className="px-4 py-2.5 text-left">Employee</th>
                    {TRACKED_LEAVE_TYPES.map((t) => (
                      <th key={t.key} className="px-4 py-2.5 text-left">{t.label}</th>
                    ))}
                    <th className="px-4 py-2.5 text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b) => (
                    <tr key={b.user.id} className="border-b border-surface-100 last:border-0 dark:border-surface-800/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={b.user} src={b.user.avatarUrl} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-surface-900 dark:text-surface-100">{fullName(b.user)}</p>
                            {b.pending > 0 && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">{b.pending} day(s) pending</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {TRACKED_LEAVE_TYPES.map((t) => (
                        <td key={t.key} className="px-4 py-3">
                          <Meter used={b.types[t.key].used} total={b.types[t.key].entitlement} tone={t.tone} />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <Badge color={b.remaining <= 3 ? 'red' : b.remaining <= 8 ? 'amber' : 'green'}>
                          {b.remaining} / {b.entitlement} days
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
