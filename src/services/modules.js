import { request } from '@/api/client';
import { createResourceService } from './resourceService';

/**
 * Services for HR modules that follow the standard backend REST convention.
 * Pages built on ResourcePage consume these directly; when the backend ships
 * a module, its page starts working without frontend changes.
 */
export const departmentService = createResourceService('departments');
export const designationService = createResourceService('designations');
export const attendanceService = createResourceService('attendance');
export const leaveService = {
  ...createResourceService('leaves'),
  /** Per-leave-type balance for an employee: [{ type, allocated, used, pending, remaining, available }]. */
  balance: (employee) => request({ method: 'GET', url: '/leaves/balance', params: { employee } }),
  /** Manager's approval queue — leaves from their direct reports awaiting a decision. */
  approvalQueue: (params = {}) =>
    request({ method: 'GET', url: '/leaves', params: { pendingApproval: 'me', ...params } }),
  approve: (id) => request({ method: 'POST', url: `/leaves/${id}/approve` }),
  reject: (id, reason) => request({ method: 'POST', url: `/leaves/${id}/reject`, data: { reason } }),
  cancel: (id) => request({ method: 'POST', url: `/leaves/${id}/cancel` }),
};
export const leaveTypeService = createResourceService('leave-types');
export const holidayService = createResourceService('holidays');
export const payrollService = createResourceService('payroll');
export const jobService = createResourceService('jobs');
export const candidateService = createResourceService('candidates');
export const interviewService = createResourceService('interviews');
export const onboardingService = {
  ...createResourceService('onboarding'),
  // Checklist — every task mutation returns the full updated onboarding
  // (progress + status + tasks), so callers can refresh from one response.
  addTask: (id, title) => request({ method: 'POST', url: `/onboarding/${id}/tasks`, data: { title } }),
  updateTask: (id, taskId, data) => request({ method: 'PATCH', url: `/onboarding/${id}/tasks/${taskId}`, data }),
  deleteTask: (id, taskId) => request({ method: 'DELETE', url: `/onboarding/${id}/tasks/${taskId}` }),
};
export const performanceService = createResourceService('performance-reviews');
export const goalService = createResourceService('goals');
export const courseService = createResourceService('courses');
export const assetService = createResourceService('assets');
export const expenseService = createResourceService('expenses');
export const ticketService = createResourceService('tickets');
export const documentService = createResourceService('documents');
export const notificationService = createResourceService('notifications');
export const companyService = createResourceService('companies');
