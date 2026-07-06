import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  selectUser,
  selectAuthStatus,
  selectPermissions,
  selectRoles,
  setCredentials,
  clearCredentials,
} from '@/store/authSlice';
import { authService } from '@/services/authService';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);
  const permissions = useSelector(selectPermissions);
  const roles = useSelector(selectRoles);

  const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');

  /** hasPermission('user:create') — admins pass everything. */
  const hasPermission = useCallback(
    (perm) => {
      if (!perm) return true;
      if (isAdmin) return true;
      if (permissions.includes('*')) return true;
      const list = Array.isArray(perm) ? perm : [perm];
      return list.some((p) => permissions.includes(p));
    },
    [permissions, isAdmin]
  );

  const hasRole = useCallback(
    (role) => {
      const list = Array.isArray(role) ? role : [role];
      return list.some((r) => roles.includes(r));
    },
    [roles]
  );

  const applyLogin = useCallback(
    (authUser) => dispatch(setCredentials(authUser)),
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* token already dead — proceed */
    }
    queryClient.clear();
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  }, [dispatch, navigate, queryClient]);

  return {
    user,
    status,
    permissions,
    roles,
    isAdmin,
    isAuthenticated: status === 'authenticated',
    hasPermission,
    hasRole,
    applyLogin,
    logout,
  };
}

export default useAuth;
