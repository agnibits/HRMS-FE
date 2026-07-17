import { useQuery } from '@tanstack/react-query';
import { LuTreePalm } from 'react-icons/lu';
import { leaveService } from '@/services/modules';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { SkeletonText } from '@/components/common/Skeleton';

function pct(a, b) {
  if (!b) return 0;
  return Math.min(100, Math.round((a / b) * 100));
}

/**
 * Leave balance per type for an employee.
 * Reads GET /leaves/balance?employee=<id> → [{ type, allocated, used, pending, remaining, available }].
 */
export function LeaveBalanceCard({ employeeId, title = 'Leave balance', description = 'Allocated, used and remaining days per leave type.' }) {
  const query = useQuery({
    queryKey: ['leaves', 'balance', employeeId],
    queryFn: () => leaveService.balance(employeeId),
    enabled: !!employeeId,
    retry: false,
  });

  const rows = query.data?.data || [];

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>
        {query.isLoading ? (
          <SkeletonText lines={4} />
        ) : query.error ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={LuTreePalm}
            title="No leave policy assigned"
            description="This employee has no leave types allocated yet. Define your company's leave policy under Leave → Leave Policy, and balances will appear here automatically."
            className="py-6"
          />
        ) : (
          <ul className="space-y-4">
            {rows.map((b) => {
              const code = b.type || b.code;
              const allocated = b.allocated ?? 0;
              const used = b.used ?? 0;
              const pending = b.pending ?? 0;
              const remaining = b.remaining ?? b.available ?? Math.max(0, allocated - used - pending);
              const color = b.color || '#64748b';
              return (
                <li key={code}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-surface-800 dark:text-surface-200">
                      <span className="size-2.5 rounded-full" style={{ background: color }} />
                      {b.name || code}
                    </span>
                    <span className="tabular-nums text-surface-500 dark:text-surface-400">
                      <span className="font-semibold text-surface-900 dark:text-surface-100">{remaining}</span>
                      {' '}/ {allocated} left
                    </span>
                  </div>
                  {/* Stacked bar: used + pending against allocation */}
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                    <span className="h-full" style={{ width: `${pct(used, allocated)}%`, background: color }} title={`Used: ${used}`} />
                    <span className="h-full opacity-40" style={{ width: `${pct(pending, allocated)}%`, background: color }} title={`Pending: ${pending}`} />
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-surface-400">
                    <span>Used {used}</span>
                    {pending > 0 && <span>Pending {pending}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

export default LeaveBalanceCard;
