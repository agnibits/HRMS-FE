import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearCredentials } from './authSlice';
import uiReducer from './uiSlice';
import { registerSessionExpiredHandler } from '@/api/client';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

// When a token refresh fails, drop straight to the login screen.
registerSessionExpiredHandler(() => {
  store.dispatch(clearCredentials());
});

export default store;
