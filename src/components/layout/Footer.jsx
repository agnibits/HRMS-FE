import { APP_NAME } from '@/constants';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-200 px-6 py-4 text-center text-xs text-surface-400 dark:border-surface-800 dark:text-surface-500">
      © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
    </footer>
  );
}

export default Footer;
