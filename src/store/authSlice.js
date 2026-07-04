import { createSlice } from '@reduxjs/toolkit';

/**
 * Global auth state. Token persistence lives in utils/storage; this slice
 * holds the authenticated user + permissions for RBAC-aware rendering.
 */
const initialState = {
  user: null,          // AuthUser: { id, email, firstName, lastName, roles: [], permissions: [] }
  status: 'booting',   // 'booting' | 'authenticated' | 'guest'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    clearCredentials(state) {
      state.user = null;
      state.status = 'guest';
    },
  },
});

export const { setCredentials, updateUser, clearCredentials } = authSlice.actions;

export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectPermissions = (s) => s.auth.user?.permissions || [];
export const selectRoles = (s) => s.auth.user?.roles || [];

export default authSlice.reducer;
