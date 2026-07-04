import cn from '@/utils/cn';

const sizes = { xs: 'size-3', sm: 'size-4', md: 'size-6', lg: 'size-8', xl: 'size-12' };

export function Spinner({ size = 'md', className }) {
  return (
    <svg
      className={cn('animate-spin text-primary-600', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/** Full-area loader for page-level suspense/loading. */
export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
    </div>
  );
}

export default Spinner;
