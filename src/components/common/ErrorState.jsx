import { FiAlertTriangle, FiLock, FiWifiOff, FiClock } from 'react-icons/fi';
import Button from './Button';

/** Renders an API error (normalized by the axios client) with a retry affordance. */
export function ErrorState({ error, onRetry, className = '' }) {
  const status = error?.status;
  const notShipped = status === 404;

  const Icon =
    status === 0 ? FiWifiOff : status === 403 ? FiLock : notShipped ? FiClock : FiAlertTriangle;

  const title =
    status === 0
      ? 'Connection problem'
      : status === 403
        ? 'Access denied'
        : notShipped
          ? 'Module not available yet'
          : 'Something went wrong';

  const description = notShipped
    ? 'This module is not enabled on the server yet. It will activate automatically once the backend ships it.'
    : error?.message || 'An unexpected error occurred while loading this data.';

  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
        <Icon className="size-7 text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-surface-500 dark:text-surface-400">{description}</p>
      {onRetry && !notShipped && status !== 403 && (
        <Button className="mt-5" size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
