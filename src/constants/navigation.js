import {
  FiGrid, FiUsers, FiLayers, FiAward, FiClock, FiCalendar, FiSun, FiDollarSign,
  FiBriefcase, FiUserPlus, FiTrendingUp, FiTarget, FiBookOpen, FiMonitor,
  FiCreditCard, FiLifeBuoy, FiFolder, FiBell, FiFileText, FiPieChart,
  FiSettings, FiShield, FiActivity,
} from 'react-icons/fi';

/**
 * Sidebar navigation, grouped. `permission` hides items the user can't access.
 */
export const NAVIGATION = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/', icon: FiGrid },
      { label: 'Analytics', to: '/analytics', icon: FiPieChart },
    ],
  },
  {
    group: 'Workforce',
    items: [
      { label: 'Employees', to: '/employees', icon: FiUsers, permission: 'user:read' },
      { label: 'Departments', to: '/departments', icon: FiLayers },
      { label: 'Designations', to: '/designations', icon: FiAward },
      { label: 'Onboarding', to: '/onboarding', icon: FiUserPlus },
    ],
  },
  {
    group: 'Time',
    items: [
      { label: 'Attendance', to: '/attendance', icon: FiClock },
      { label: 'Leave', to: '/leave', icon: FiCalendar },
      { label: 'Holidays', to: '/holidays', icon: FiSun },
    ],
  },
  {
    group: 'Talent',
    items: [
      { label: 'Recruitment', to: '/recruitment', icon: FiBriefcase },
      { label: 'Performance', to: '/performance', icon: FiTrendingUp },
      { label: 'Goals (OKRs)', to: '/goals', icon: FiTarget },
      { label: 'Learning', to: '/learning', icon: FiBookOpen },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Payroll', to: '/payroll', icon: FiDollarSign },
      { label: 'Assets', to: '/assets', icon: FiMonitor },
      { label: 'Expenses', to: '/expenses', icon: FiCreditCard },
      { label: 'Help Desk', to: '/helpdesk', icon: FiLifeBuoy },
      { label: 'Documents', to: '/documents', icon: FiFolder },
    ],
  },
  {
    group: 'Insights',
    items: [
      { label: 'Reports', to: '/reports', icon: FiFileText },
      { label: 'Notifications', to: '/notifications', icon: FiBell },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Company Settings', to: '/settings/company', icon: FiSettings },
      { label: 'Roles & Permissions', to: '/settings/roles', icon: FiShield, permission: 'role:read' },
      { label: 'Audit Logs', to: '/audit-logs', icon: FiActivity, permission: 'audit:read' },
    ],
  },
];
