import { useState } from 'react';
import { motion } from 'framer-motion';
import cn from '@/utils/cn';

/**
 * tabs: [{ key, label, icon?, badge?, content? }]
 * Controlled (value/onChange) or uncontrolled.
 */
export function Tabs({ tabs, value, onChange, defaultTab, className, children }) {
  const [internal, setInternal] = useState(defaultTab || tabs[0]?.key);
  const active = value ?? internal;
  const setActive = (k) => {
    if (onChange) onChange(k);
    else setInternal(k);
  };
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-surface-200 dark:border-surface-800"
      >
        {tabs.map((t) => {
          const isActive = t.key === active;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-500 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200'
              )}
            >
              {Icon && <Icon className="size-4" />}
              {t.label}
              {t.badge !== undefined && (
                <span className="rounded-full bg-surface-100 px-1.5 py-0.5 text-xs text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                  {t.badge}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary-600 dark:bg-primary-400"
                />
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-5">
        {children ? children(active) : activeTab?.content}
      </div>
    </div>
  );
}

export default Tabs;
