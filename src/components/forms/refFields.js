import { userService } from '@/services/userService';
import { candidateService, departmentService, designationService } from '@/services/modules';
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

/**
 * Any user-reference field (reviewer, requester, manager, assignee…).
 * Pass `remote: { excludeField: 'employee' }` in overrides to hide the value
 * held by another field (e.g. a person can't be their own onboarding buddy).
 */
export const userRefField = (name, label, { remote: remoteOverride, ...rest } = {}) => ({
  name,
  label,
  type: 'remote',
  remote: { service: userService, toOption: userOption, ...remoteOverride },
  ...rest,
});

/** Department picker → sends departmentId, links to the Departments module. */
export const departmentField = (overrides = {}) => ({
  name: 'departmentId',
  label: 'Department',
  type: 'remote',
  remote: { service: departmentService, toOption: (d) => ({ value: d.id, label: d.name }) },
  ...overrides,
});

/** Designation picker → sends designationId, links to the Designations module. */
export const designationField = (overrides = {}) => ({
  name: 'designationId',
  label: 'Designation',
  type: 'remote',
  remote: { service: designationService, toOption: (d) => ({ value: d.id, label: d.title }) },
  ...overrides,
});

/** Reporting manager picker → sends managerId. */
export const managerField = (overrides = {}) =>
  userRefField('managerId', 'Reporting Manager', overrides);

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
