import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import AppRoutes from '@/routes';
import { authService } from '@/services/authService';
import { setCredentials, clearCredentials } from '@/store/authSlice';
import { tokenStorage } from '@/utils/storage';
import { useTheme } from '@/context/ThemeContext';

/** Restores the session on hard refresh via GET /auth/me. */
function useAuthBootstrap() {
  const dispatch = useDispatch();
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!tokenStorage.getAccess() && !tokenStorage.getRefresh()) {
        dispatch(clearCredentials());
        return;
      }
      try {
        const user = await authService.me();
        if (!cancelled) dispatch(setCredentials(user));
      } catch {
        if (!cancelled) {
          tokenStorage.clear();
          dispatch(clearCredentials());
        }
      }
    }
    boot();
    return () => { cancelled = true; };
  }, [dispatch]);
}

export default function App() {
  useAuthBootstrap();
  const { theme } = useTheme();

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style:
            theme === 'dark'
              ? { background: '#172033', color: '#f1f5f9', border: '1px solid #334155' }
              : { background: '#ffffff', color: '#0f172a', boxShadow: '0 10px 30px -6px rgb(15 23 42 / 0.18)' },
        }}
      />
    </>
  );
}
