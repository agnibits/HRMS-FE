import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import cn from '@/utils/cn';
import { IconButton } from '@/components/common/Button';

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' };

export function Drawer({ isOpen, onClose, title, size = 'md', children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-surface-950/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-pop dark:bg-surface-900',
              widths[size]
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
          >
            <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4 dark:border-surface-800">
              <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">{title}</h2>
              <IconButton icon={FiX} label="Close" size="sm" onClick={onClose} />
            </div>
            <div className="grow overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-surface-200 px-5 py-4 dark:border-surface-800">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Drawer;
