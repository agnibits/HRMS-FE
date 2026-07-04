import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { APP_NAME } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { IconButton } from '@/components/common/Button';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface-950 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 10%, #4f46e5 0%, transparent 60%), radial-gradient(50% 40% at 90% 90%, #312e81 0%, transparent 55%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">A</span>
          <span className="text-xl font-bold text-white">{APP_NAME}</span>
        </div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="max-w-md text-4xl font-bold leading-tight text-white">
            Everything your people team needs, in one place.
          </h1>
          <p className="mt-4 max-w-md text-surface-300">
            Employees, attendance, leave, payroll, recruitment and performance —
            unified in a single modern workspace.
          </p>
        </motion.div>
        <p className="relative text-sm text-surface-400">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-col items-center justify-center bg-surface-50 px-4 py-10 dark:bg-surface-950 lg:w-1/2">
        <div className="absolute right-4 top-4">
          <IconButton
            icon={theme === 'dark' ? FiSun : FiMoon}
            label="Toggle theme"
            onClick={toggleTheme}
          />
        </div>
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white">A</span>
          <span className="text-lg font-bold text-surface-900 dark:text-white">{APP_NAME}</span>
        </div>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;
