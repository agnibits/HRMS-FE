import cn from '@/utils/cn';
import { STATUS_COLORS } from '@/constants';
import { titleCase } from '@/utils/formatters';

const palette = {
  gray: 'bg-surface-100 text-surface-600 ring-surface-500/20 dark:bg-surface-800 dark:text-surface-300',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300',
  red: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/60 dark:text-red-300',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-950/60 dark:text-amber-300',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950/60 dark:text-orange-300',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/60 dark:text-sky-300',
  purple: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/60 dark:text-violet-300',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-950/60 dark:text-teal-300',
  primary: 'bg-primary-50 text-primary-700 ring-primary-600/20 dark:bg-primary-950 dark:text-primary-300',
};

export function Badge({ color = 'gray', children, className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        palette[color] || palette.gray,
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Maps a backend status enum to a colored chip automatically. */
export function StatusChip({ status, className }) {
  if (!status) return <span className="text-surface-400">—</span>;
  const color = STATUS_COLORS[String(status).toUpperCase()] || 'gray';
  return (
    <Badge color={color} dot className={className}>
      {titleCase(status)}
    </Badge>
  );
}

export default Badge;
