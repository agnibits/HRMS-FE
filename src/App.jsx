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
              ? { background: '#1b1d25', color: '#f1f2f5', border: '1px solid #262933' }
              : { background: '#ffffff', color: '#15161d', boxShadow: '0 16px 40px -12px rgb(16 17 26 / 0.28)' },
        }}
      />
    </>
  );
}
