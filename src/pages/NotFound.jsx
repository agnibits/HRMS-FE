import { Link } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4 text-center dark:bg-surface-950">
      <p className="text-7xl font-black text-primary-600/20 dark:text-primary-400/20">404</p>
      <h1 className="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-50">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-surface-500 dark:text-surface-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
      >
        <LuArrowLeft className="size-4" /> Back to dashboard
      </Link>
    </div>
  );
}
