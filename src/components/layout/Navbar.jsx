import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LuBell, LuKeyRound, LuLogOut, LuMenu, LuMoon, LuPanelLeft, LuSparkles, LuSun, LuUserRound,
} from 'react-icons/lu';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { toggleSidebar, setSidebarMobileOpen, setAiOpen } from '@/store/uiSlice';
import { fullName } from '@/utils/formatters';
import Avatar from '@/components/common/Avatar';
import Dropdown from '@/components/common/Dropdown';
import { IconButton } from '@/components/common/Button';
import Badge from '@/components/common/Badge';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, roles } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-surface-200/70 bg-white/70 px-4 backdrop-blur-md dark:border-surface-800/60 dark:bg-surface-950/75 sm:px-6">
      <IconButton
        icon={LuMenu}
        label="Open menu"
        className="lg:hidden"
        onClick={() => dispatch(setSidebarMobileOpen(true))}
      />
      <IconButton
        icon={LuPanelLeft}
        label="Toggle sidebar"
        className="hidden lg:inline-flex"
        onClick={() => dispatch(toggleSidebar())}
      />

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => dispatch(setAiOpen(true))}
          className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-800/60 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-900/50"
        >
          <LuSparkles className="size-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
        <IconButton
          icon={theme === 'dark' ? LuSun : LuMoon}
          label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
        />
        <IconButton icon={LuBell} label="Notifications" onClick={() => navigate('/notifications')} />

        <Dropdown
          align="right"
          width="w-60"
          trigger={
            <button className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800">
              <Avatar name={user} size="sm" src={user?.avatarUrl} />
              <span className="hidden text-left md:block">
                <span className="block max-w-36 truncate text-sm font-medium text-surface-800 dark:text-surface-100">
                  {fullName(user)}
                </span>
                <span className="block text-xs text-surface-400">{roles[0] || 'Member'}</span>
              </span>
            </button>
          }
          items={[
            {
              key: 'header',
              label: (
                <span>
                  <span className="block truncate font-medium">{user?.email}</span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {roles.slice(0, 3).map((r) => (
                      <Badge key={r} color="primary" className="text-[10px]">{r}</Badge>
                    ))}
                  </span>
                </span>
              ),
              onClick: () => navigate('/profile'),
            },
            null,
            { key: 'profile', label: 'My Profile', icon: LuUserRound, onClick: () => navigate('/profile') },
            { key: 'password', label: 'Change Password', icon: LuKeyRound, onClick: () => navigate('/change-password') },
            null,
            { key: 'logout', label: 'Sign out', icon: LuLogOut, danger: true, onClick: logout },
          ]}
        />
      </div>
    </header>
  );
}

export default Navbar;
