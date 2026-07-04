import { motion } from 'framer-motion';
import cn from '@/utils/cn';
import { Card } from './Card';
import { Skeleton } from '@/components/common/Skeleton';
import { formatNumber } from '@/utils/formatters';

const accents = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
};

export function StatCard({ label, value, icon: Icon, accent = 'primary', delta, deltaLabel, loading, onClick }) {
  if (loading) {
    return (
      <Card className="p-5">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-8 w-20" />
        <Skeleton className="h-3 w-28" />
      </Card>
    );
  }

  const deltaPositive = typeof delta === 'number' && delta >= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card
        className={cn('flex items-start justify-between gap-3 p-5', onClick && 'cursor-pointer transition-shadow hover:shadow-pop')}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-surface-500 dark:text-surface-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-surface-900 dark:text-surface-50 sm:text-3xl">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
          {(delta !== undefined || deltaLabel) && (
            <p className="mt-1.5 flex items-center gap-1 text-xs">
              {typeof delta === 'number' && (
                <span className={cn('font-semibold', deltaPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {deltaPositive ? '▲' : '▼'} {Math.abs(delta)}%
                </span>
              )}
              {deltaLabel && <span className="text-surface-400">{deltaLabel}</span>}
            </p>
          )}
        </div>
        {Icon && (
          <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', accents[accent])}>
            <Icon className="size-5" />
          </span>
        )}
      </Card>
    </motion.div>
  );
}

export default StatCard;
