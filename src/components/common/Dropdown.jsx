import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import cn from '@/utils/cn';

/**
 * Lightweight dropdown menu.
 * items: [{ key, label, icon?, danger?, onClick, disabled? }] — or `null` for a divider.
 */
export function Dropdown({ trigger, items, align = 'right', width = 'w-48' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'absolute z-40 mt-2 overflow-hidden rounded-xl border border-surface-200 bg-white py-1.5 shadow-pop dark:border-surface-700 dark:bg-surface-850',
              width,
              align === 'right' ? 'right-0' : 'left-0'
            )}
            role="menu"
          >
            {items.map((item, i) =>
              item === null ? (
                <div key={`div-${i}`} className="my-1.5 h-px bg-surface-100 dark:bg-surface-800" />
              ) : (
                <button
                  key={item.key || item.label}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
                      : 'text-surface-700 hover:bg-surface-50 dark:text-surface-200 dark:hover:bg-surface-800'
                  )}
                >
                  {item.icon && <item.icon className="size-4 shrink-0 opacity-70" />}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
