import axios from 'axios';
import { API_URL } from '@/constants';
import { tokenStorage } from '@/utils/storage';

/**
 * Axios instance with:
 *  - Bearer token injection
 *  - Single-flight automatic refresh on 401 (queued retries)
 *  - Normalized error objects: { status, code, message, details }
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;
let onSessionExpired = () => {};

/** Registered once by the store so the API layer can force a logout. */
export function registerSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

async function refreshTokens() {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error('No refresh token');
  // Raw axios: must not recurse through interceptors
  const res = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );
  const data = res.data?.data ?? res.data;
  if (!data?.accessToken) throw new Error('Invalid refresh response');
  tokenStorage.set(data);
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // Network / timeout
    if (!response) {
      return Promise.reject({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection and try again.',
        details: [],
      });
    }

    const isAuthRoute = config?.url?.includes('/auth/login') ||
      config?.url?.includes('/auth/refresh') ||
      config?.url?.includes('/auth/mfa/verify');

    // Attempt one silent refresh for expired access tokens
    if (response.status === 401 && !config.__isRetry && !isAuthRoute && tokenStorage.getRefresh()) {
      try {
        refreshPromise = refreshPromise || refreshTokens();
        const newToken = await refreshPromise;
        refreshPromise = null;
        config.__isRetry = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch (refreshError) {
        refreshPromise = null;
        tokenStorage.clear();
        onSessionExpired();
      }
    }

    const body = response.data || {};
    const err = body.error || {};
    return Promise.reject({
      status: response.status,
      code: err.code || 'ERROR',
      message:
        err.message ||
        body.message ||
        (response.status === 403
          ? 'You do not have permission to perform this action.'
          : response.status === 404
            ? 'The requested resource was not found.'
            : 'Something went wrong. Please try again.'),
      details: err.details || [],
    });
  }
);

/** Unwrap the uniform success envelope: returns { data, meta, message }. */
export async function request(config) {
  const res = await api(config);
  const body = res.data;
  if (body && typeof body === 'object' && 'success' in body) {
    return { data: body.data, meta: body.meta, message: body.message };
  }
  return { data: body, meta: undefined, message: undefined };
}

export default api;
