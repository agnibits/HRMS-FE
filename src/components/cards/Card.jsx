import cn from '@/utils/cn';

export function Card({ children, className, ...props }) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 border-b border-surface-200 px-5 py-4 dark:border-surface-800', className)}>
      <div>
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export default Card;
