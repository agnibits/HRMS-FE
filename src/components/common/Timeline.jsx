import cn from '@/utils/cn';
import { formatDateTime } from '@/utils/formatters';

/**
 * items: [{ id, title, description?, timestamp?, icon?, color? }]
 */
export function Timeline({ items = [], className }) {
  const colors = {
    primary: 'bg-primary-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    gray: 'bg-surface-400',
  };

  return (
    <ol className={cn('relative space-y-6 border-l border-surface-200 pl-6 dark:border-surface-700', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                'absolute -left-[31px] top-0.5 flex size-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-surface-900',
                colors[item.color] || colors.primary
              )}
            >
              {Icon && <Icon className="size-2.5 text-white" />}
            </span>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{item.title}</p>
              {item.timestamp && (
                <time className="text-xs text-surface-400">{formatDateTime(item.timestamp)}</time>
              )}
            </div>
            {item.description && (
              <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{item.description}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default Timeline;
