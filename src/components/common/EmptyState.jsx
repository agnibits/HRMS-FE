import { FiInbox } from 'react-icons/fi';
import Button from './Button';

export function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
        <Icon className="size-7 text-surface-400 dark:text-surface-500" />
      </div>
      <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-surface-500 dark:text-surface-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-5" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
