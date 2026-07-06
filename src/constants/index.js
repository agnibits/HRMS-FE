export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Agnibits HRMS';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const USER_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED'];

/**
 * Platform-only roles that belong to Agnibits (the vendor), never to a tenant
 * company. Hidden from tenant role lists and role assignment — a company's
 * roles start at ADMIN.
 */
export const PLATFORM_ROLES = ['SUPER_ADMIN'];
export const isTenantRole = (role) => !PLATFORM_ROLES.includes(role?.name || role);

export const STATUS_COLORS = {
  // user / generic
  ACTIVE: 'green',
  PENDING: 'amber',
  SUSPENDED: 'orange',
  DISABLED: 'red',
  INACTIVE: 'gray',
  // workflow-ish
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
  DRAFT: 'gray',
  OPEN: 'blue',
  IN_PROGRESS: 'blue',
  ON_HOLD: 'amber',
  CLOSED: 'gray',
  COMPLETED: 'green',
  SUCCESS: 'green',
  FAILURE: 'red',
  PAID: 'green',
  UNPAID: 'amber',
  PROCESSING: 'blue',
  PRESENT: 'green',
  ABSENT: 'red',
  LATE: 'amber',
  HALF_DAY: 'orange',
  ON_LEAVE: 'purple',
  SCHEDULED: 'blue',
  HIRED: 'green',
  OFFERED: 'teal',
  SHORTLISTED: 'blue',
  APPLIED: 'gray',
  INTERVIEW: 'purple',
};

export const PAGE_SIZES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

/** Permission strings follow the backend `resource:action` convention. */
export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  AUDIT_READ: 'audit:read',
};

export const QUERY_KEYS = {
  me: ['auth', 'me'],
  sessions: ['auth', 'sessions'],
  devices: ['auth', 'devices'],
  users: 'users',
  roles: 'roles',
  permissions: ['roles', 'permissions'],
  auditLogs: 'audit-logs',
};
