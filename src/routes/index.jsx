import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, PermissionRoute } from './guards';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { PageLoader } from '@/components/common/Spinner';

const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Employees = lazy(() => import('@/pages/employees/Employees'));
const EmployeeProfile = lazy(() => import('@/pages/employees/EmployeeProfile'));
const Departments = lazy(() => import('@/pages/Departments'));
const Designations = lazy(() => import('@/pages/Designations'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Attendance = lazy(() => import('@/pages/Attendance'));
const Leave = lazy(() => import('@/pages/Leave'));
const Holidays = lazy(() => import('@/pages/Holidays'));
const Recruitment = lazy(() => import('@/pages/recruitment/Recruitment'));
const CandidateDetails = lazy(() => import('@/pages/recruitment/CandidateDetails'));
const InterviewScheduling = lazy(() => import('@/pages/recruitment/InterviewScheduling'));
const Performance = lazy(() => import('@/pages/Performance'));
const Goals = lazy(() => import('@/pages/Goals'));
const Learning = lazy(() => import('@/pages/Learning'));
const Payroll = lazy(() => import('@/pages/Payroll'));
const Assets = lazy(() => import('@/pages/Assets'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const HelpDesk = lazy(() => import('@/pages/HelpDesk'));
const Documents = lazy(() => import('@/pages/Documents'));
const Reports = lazy(() => import('@/pages/Reports'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const CompanySettings = lazy(() => import('@/pages/settings/CompanySettings'));
const RolesPermissions = lazy(() => import('@/pages/settings/RolesPermissions'));
const AuditLogs = lazy(() => import('@/pages/AuditLogs'));
const Companies = lazy(() => import('@/pages/platform/Companies'));
const Profile = lazy(() => import('@/pages/profile/Profile'));
const ChangePassword = lazy(() => import('@/pages/profile/ChangePassword'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* Protected app */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/platform/companies" element={<Companies />} />

            <Route
              path="/employees"
              element={<PermissionRoute permission="user:read"><Employees /></PermissionRoute>}
            />
            <Route
              path="/employees/:id"
              element={<PermissionRoute permission="user:read"><EmployeeProfile /></PermissionRoute>}
            />
            <Route path="/departments" element={<Departments />} />
            <Route path="/designations" element={<Designations />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/holidays" element={<Holidays />} />

            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/recruitment/candidates/:id" element={<CandidateDetails />} />
            <Route path="/recruitment/interviews" element={<InterviewScheduling />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/learning" element={<Learning />} />

            <Route path="/payroll" element={<Payroll />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/helpdesk" element={<HelpDesk />} />
            <Route path="/documents" element={<Documents />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/settings/company" element={<CompanySettings />} />
            <Route
              path="/settings/roles"
              element={<PermissionRoute permission="role:read"><RolesPermissions /></PermissionRoute>}
            />
            <Route
              path="/audit-logs"
              element={<PermissionRoute permission="audit:read"><AuditLogs /></PermissionRoute>}
            />

            <Route path="/profile" element={<Profile />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
