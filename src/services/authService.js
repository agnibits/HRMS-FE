import { request } from '@/api/client';
import { tokenStorage } from '@/utils/storage';

export const authService = {
  /** Returns either { mfaRequired, mfaToken } or { accessToken, ..., user }. */
  async login({ email, password }) {
    const { data } = await request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password, deviceName: buildDeviceName() },
    });
    if (data?.accessToken) tokenStorage.set(data);
    return data;
  },

  async verifyMfa({ mfaToken, code }) {
    const { data } = await request({
      method: 'POST',
      url: '/auth/mfa/verify',
      data: { mfaToken, code },
    });
    if (data?.accessToken) tokenStorage.set(data);
    return data;
  },

  async me() {
    const { data } = await request({ method: 'GET', url: '/auth/me' });
    return data;
  },

  async logout() {
    try {
      await request({ method: 'POST', url: '/auth/logout' });
    } finally {
      tokenStorage.clear();
    }
  },

  logoutAll: () => request({ method: 'POST', url: '/auth/logout-all' }),

  forgotPassword: (payload) =>
    request({ method: 'POST', url: '/auth/forgot-password', data: payload }),

  resetPassword: (payload) =>
    request({ method: 'POST', url: '/auth/reset-password', data: payload }),

  verifyEmail: (payload) =>
    request({ method: 'POST', url: '/auth/verify-email', data: payload }),

  sendVerification: () => request({ method: 'POST', url: '/auth/send-verification' }),

  changePassword: (payload) =>
    request({ method: 'POST', url: '/auth/change-password', data: payload }),

  // ---- MFA ----
  mfaSetup: () => request({ method: 'POST', url: '/auth/mfa/setup' }),
  mfaEnable: (payload) => request({ method: 'POST', url: '/auth/mfa/enable', data: payload }),
  mfaDisable: (payload) => request({ method: 'POST', url: '/auth/mfa/disable', data: payload }),

  // ---- Sessions & devices ----
  sessions: () => request({ method: 'GET', url: '/auth/sessions' }),
  revokeSession: (id) => request({ method: 'DELETE', url: `/auth/sessions/${id}` }),
  devices: () => request({ method: 'GET', url: '/auth/devices' }),
  trustDevice: (id, isTrusted) =>
    request({ method: 'PATCH', url: `/auth/devices/${id}/trust`, data: { isTrusted } }),
  removeDevice: (id) => request({ method: 'DELETE', url: `/auth/devices/${id}` }),
};

function buildDeviceName() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Browser';
  const platform = /Windows/.test(ua)
    ? 'Windows'
    : /Mac/.test(ua)
      ? 'macOS'
      : /Linux/.test(ua)
        ? 'Linux'
        : /Android/.test(ua)
          ? 'Android'
          : /iPhone|iPad/.test(ua)
            ? 'iOS'
            : 'Unknown';
  return `${browser} on ${platform}`;
}

export default authService;
