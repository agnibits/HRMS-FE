import { useState } from 'react';
import cn from '@/utils/cn';
import { initials } from '@/utils/formatters';

const sizes = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-20 text-2xl',
};

// Deterministic background per name so avatars stay stable across renders
const bgs = [
  'bg-primary-600', 'bg-emerald-600', 'bg-sky-600', 'bg-violet-600',
  'bg-rose-600', 'bg-amber-600', 'bg-teal-600', 'bg-fuchsia-600',
];

export function Avatar({ src, name = '', size = 'md', className }) {
  const [errored, setErrored] = useState(false);
  const label = initials(name);
  const bg = bgs[(label.charCodeAt(0) || 0) % bgs.length];

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={typeof name === 'string' ? name : 'avatar'}
        onError={() => setErrored(true)}
        className={cn('rounded-full object-cover ring-2 ring-white dark:ring-surface-900', sizes[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white',
        bg,
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

export default Avatar;
