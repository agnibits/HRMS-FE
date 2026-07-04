import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu';
import cn from '@/utils/cn';
import { PAGE_SIZES } from '@/constants';
import { formatNumber } from '@/utils/formatters';

export function Pagination({ pagination, page, limit, onPageChange, onLimitChange }) {
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const btn =
    'inline-flex size-8 items-center justify-center rounded-lg border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-200 px-4 py-3 dark:border-surface-800 sm:flex-row">
      <div className="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-400">
        <span>
          Showing <span className="font-medium text-surface-700 dark:text-surface-200">{formatNumber(from)}–{formatNumber(to)}</span> of{' '}
          <span className="font-medium text-surface-700 dark:text-surface-200">{formatNumber(total)}</span>
        </span>
        <select
          aria-label="Rows per page"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-surface-200 bg-white px-2 py-1 text-xs dark:border-surface-700 dark:bg-surface-900"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / page</option>
          ))}
        </select>
      </div>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        <button className={btn} disabled={page <= 1} onClick={() => onPageChange(1)} aria-label="First page">
          <LuChevronsLeft className="size-4" />
        </button>
        <button className={btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <LuChevronLeft className="size-4" />
        </button>
        <span className="px-2 text-sm text-surface-600 dark:text-surface-300">
          Page <span className="font-semibold">{page}</span> of {Math.max(totalPages, 1)}
        </span>
        <button className={btn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <LuChevronRight className="size-4" />
        </button>
        <button className={btn} disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} aria-label="Last page">
          <LuChevronsRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
