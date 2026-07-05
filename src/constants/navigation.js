import {
  LuLayoutDashboard, LuUsersRound, LuBuilding2, LuBadgeCheck, LuClock, LuCalendarDays,
  LuTreePalm, LuWallet, LuBriefcaseBusiness, LuUserRoundPlus, LuTrendingUp, LuGoal,
  LuGraduationCap, LuLaptop, LuReceipt, LuLifeBuoy, LuFolderOpen, LuBell,
  LuFileChartColumn, LuChartPie, LuSettings, LuShieldCheck, LuScrollText, LuBuilding,
} from 'react-icons/lu';

/**
 * Sidebar navigation, grouped. `permission` hides items the user can't access.
 */
export const NAVIGATION = [
  {
    group: 'Platform',
    items: [
      { label: 'Companies', to: '/platform/companies', icon: LuBuilding, superAdmin: true },
    ],
  },
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/', icon: LuLayoutDashboard },
      { label: 'Analytics', to: '/analytics', icon: LuChartPie },
    ],
  },
  {
    group: 'Workforce',
    items: [
      { label: 'Employees', to: '/employees', icon: LuUsersRound, permission: 'user:read' },
      { label: 'Departments', to: '/departments', icon: LuBuilding2 },
      { label: 'Designations', to: '/designations', icon: LuBadgeCheck },
      { label: 'Onboarding', to: '/onboarding', icon: LuUserRoundPlus },
    ],
  },
  {
    group: 'Time',
    items: [
      { label: 'Attendance', to: '/attendance', icon: LuClock },
      { label: 'Leave', to: '/leave', icon: LuCalendarDays },
      { label: 'Holidays', to: '/holidays', icon: LuTreePalm },
    ],
  },
  {
    group: 'Talent',
    items: [
      { label: 'Recruitment', to: '/recruitment', icon: LuBriefcaseBusiness },
      { label: 'Performance', to: '/performance', icon: LuTrendingUp },
      { label: 'Goals (OKRs)', to: '/goals', icon: LuGoal },
      { label: 'Learning', to: '/learning', icon: LuGraduationCap },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Payroll', to: '/payroll', icon: LuWallet },
      { label: 'Assets', to: '/assets', icon: LuLaptop },
      { label: 'Expenses', to: '/expenses', icon: LuReceipt },
      { label: 'Help Desk', to: '/helpdesk', icon: LuLifeBuoy },
      { label: 'Documents', to: '/documents', icon: LuFolderOpen },
    ],
  },
  {
    group: 'Insights',
    items: [
      { label: 'Reports', to: '/reports', icon: LuFileChartColumn },
      { label: 'Notifications', to: '/notifications', icon: LuBell },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Company Settings', to: '/settings/company', icon: LuSettings },
      { label: 'Roles & Permissions', to: '/settings/roles', icon: LuShieldCheck, permission: 'role:read' },
      { label: 'Audit Logs', to: '/audit-logs', icon: LuScrollText, permission: 'audit:read' },
    ],
  },
];
