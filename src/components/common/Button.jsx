import { forwardRef } from 'react';
import cn from '@/utils/cn';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500/40 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(16_17_26/0.24)]',
  secondary:
    'border border-surface-300/90 bg-white text-surface-700 shadow-[0_1px_2px_rgb(16_17_26/0.05)] hover:bg-surface-50 dark:border-surface-700/80 dark:bg-surface-850 dark:text-surface-200 dark:shadow-none dark:hover:bg-surface-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(16_17_26/0.24)]',
  ghost:
    'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-100',
  subtle:
    'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9.5 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    fullWidth,
    className,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : LeftIcon && <LeftIcon className="size-4 shrink-0" />}
      {children}
      {RightIcon && !loading && <RightIcon className="size-4 shrink-0" />}
    </button>
  );
});

/** Square icon-only button (toolbars, table row actions). */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', size = 'md', className, ...props },
  ref
) {
  const dims = { sm: 'size-7', md: 'size-9', lg: 'size-10' };
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        dims[size],
        className
      )}
      {...props}
    >
      <Icon className="size-4.5" />
    </button>
  );
});

export default Button;
