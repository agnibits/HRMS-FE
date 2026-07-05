import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX } from 'react-icons/lu';
import cn from '@/utils/cn';
import { APP_NAME } from '@/constants';
import { NAVIGATION } from '@/constants/navigation';
import { useAuth } from '@/hooks/useAuth';
import { selectSidebarCollapsed, selectSidebarMobileOpen, setSidebarMobileOpen } from '@/store/uiSlice';
import { IconButton } from '@/components/common/Button';

function BrandMark({ collapsed }) {
  return (
    <div className="flex h-16 items-center gap-2.5 px-5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_2px_6px_rgb(16_132_97/0.35)]">
        A
      </span>
      {!collapsed && (
        <span className="truncate text-[15px] font-bold tracking-tight text-surface-900 dark:text-white">
          {APP_NAME}
        </span>
      )}
    </div>
  );
}

function NavItems({ collapsed, onNavigate }) {
  const { hasPermission, isSuperAdmin } = useAuth();
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6" aria-label="Main navigation">
      {NAVIGATION.map((group) => {
        const items = group.items.filter(
          (i) => (i.superAdmin ? isSuperAdmin : true) && hasPermission(i.permission)
        );
        if (!items.length) return null;
        return (
          <div key={group.group}>
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-surface-400 dark:text-surface-500">
                {group.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                        collapsed && 'justify-center',
                        isActive
                          ? 'bg-primary-600/[0.09] font-semibold text-primary-700 dark:bg-primary-400/10 dark:text-primary-300'
                          : 'text-surface-600 hover:bg-surface-200/50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/70 dark:hover:text-surface-100'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !collapsed && (
                          <span className="absolute -left-3 top-1/2 h-4.5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-600 dark:bg-primary-400" />
                        )}
                        <item.icon
                          className={cn(
                            'size-[17px] shrink-0 transition-colors',
                            !isActive && 'text-surface-400 group-hover:text-surface-600 dark:text-surface-500 dark:group-hover:text-surface-300'
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const collapsed = useSelector(selectSidebarCollapsed);
  const mobileOpen = useSelector(selectSidebarMobileOpen);
  const dispatch = useDispatch();
  const closeMobile = () => dispatch(setSidebarMobileOpen(false));

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-surface-200/80 bg-white transition-[width] duration-200 dark:border-surface-800/60 dark:bg-surface-950 lg:flex',
          collapsed ? 'w-[76px]' : 'w-64'
        )}
      >
        <BrandMark collapsed={collapsed} />
        <NavItems collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-surface-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-pop dark:bg-surface-950"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            >
              <div className="flex items-center justify-between pr-3">
                <BrandMark collapsed={false} />
                <IconButton icon={LuX} label="Close menu" onClick={closeMobile} />
              </div>
              <NavItems collapsed={false} onNavigate={closeMobile} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
