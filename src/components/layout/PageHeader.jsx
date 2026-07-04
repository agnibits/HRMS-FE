import { Link, useLocation } from 'react-router-dom';
import { LuChevronRight, LuHouse } from 'react-icons/lu';
import { titleCase } from '@/utils/formatters';

export function Breadcrumb({ items }) {
  const location = useLocation();
  const crumbs =
    items ||
    location.pathname
      .split('/')
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: titleCase(decodeURIComponent(seg)),
        to: '/' + arr.slice(0, i + 1).join('/'),
      }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-surface-400">
      <Link to="/" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400">
        <LuHouse className="size-3.5" />
        Home
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.to || i} className="flex items-center gap-1.5">
          <LuChevronRight className="size-3" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-surface-600 dark:text-surface-300">{c.label}</span>
          ) : (
            <Link to={c.to} className="hover:text-primary-600 dark:hover:text-primary-400">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ title, description, actions, breadcrumb = true, breadcrumbItems }) {
  return (
    <div className="mb-6">
      {breadcrumb && <Breadcrumb items={breadcrumbItems} />}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-surface-50 sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
