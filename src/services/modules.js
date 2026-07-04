import { createResourceService } from './resourceService';

/**
 * Services for HR modules that follow the standard backend REST convention.
 * Pages built on ResourcePage consume these directly; when the backend ships
 * a module, its page starts working without frontend changes.
 */
export const departmentService = createResourceService('departments');
export const designationService = createResourceService('designations');
export const attendanceService = createResourceService('attendance');
export const leaveService = createResourceService('leaves');
export const holidayService = createResourceService('holidays');
export const payrollService = createResourceService('payroll');
export const jobService = createResourceService('jobs');
export const candidateService = createResourceService('candidates');
export const interviewService = createResourceService('interviews');
export const onboardingService = createResourceService('onboarding');
export const performanceService = createResourceService('performance-reviews');
export const goalService = createResourceService('goals');
export const courseService = createResourceService('courses');
export const assetService = createResourceService('assets');
export const expenseService = createResourceService('expenses');
export const ticketService = createResourceService('tickets');
export const documentService = createResourceService('documents');
export const notificationService = createResourceService('notifications');
export const companyService = createResourceService('companies');
