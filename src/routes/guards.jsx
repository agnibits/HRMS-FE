import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/common/Spinner';
import ErrorState from '@/components/common/ErrorState';

/** Blocks unauthenticated users; preserves the intended destination. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'booting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader label="Signing you in…" />
      </div>
    );
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/** Redirects authenticated users away from auth pages. */
export function GuestRoute() {
  const { status } = useAuth();
  if (status === 'booting') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoader label="Loading…" />
      </div>
    );
  }
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Route-level RBAC: <PermissionRoute permission="role:read"> */
export function PermissionRoute({ permission, children }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <ErrorState error={{ status: 403, message: 'You do not have access to this page.' }} />;
  }
  return children;
}

/** Component-level RBAC: hides children when the permission is missing. */
export function Can({ permission, children, fallback = null }) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : fallback;
}
