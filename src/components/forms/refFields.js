import { userService } from '@/services/userService';
import { candidateService } from '@/services/modules';
import { fullName } from '@/utils/formatters';

/**
 * Reusable ResourcePage field configs for entity references. Each renders a
 * searchable dropdown of real records and submits the record's ID; the backend
 * resolves the display name (it also still accepts an email/legacy string).
 */

const userOption = (u) => ({
  value: u.id,
  label: `${fullName(u)}${u.email ? ` · ${u.email}` : ''}`,
});

/** Employee picker (users). */
export const employeeField = (overrides = {}) => ({
  name: 'employee',
  label: 'Employee',
  type: 'remote',
  required: true,
  remote: { service: userService, toOption: userOption },
  ...overrides,
});

/** Any user-reference field (reviewer, requester, manager, assignee…). */
export const userRefField = (name, label, overrides = {}) => ({
  name,
  label,
  type: 'remote',
  remote: { service: userService, toOption: userOption },
  ...overrides,
});

/** Candidate picker (recruitment). */
export const candidateField = (overrides = {}) => ({
  name: 'candidate',
  label: 'Candidate',
  type: 'remote',
  required: true,
  remote: {
    service: candidateService,
    toOption: (c) => ({
      value: c.id,
      label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Candidate',
    }),
  },
  ...overrides,
});
