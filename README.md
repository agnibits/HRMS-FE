# Agnibits HRMS — Frontend

Modern enterprise HRMS frontend built with React 19, Vite, and Tailwind CSS v4.

## Stack

- **React 19 + Vite** — SPA with route-level code splitting
- **Tailwind CSS v4** — design system with full light/dark theming
- **TanStack Query** — server state, caching, optimistic invalidation
- **Redux Toolkit** — global auth/UI state
- **React Hook Form + Zod** — all forms with inline validation
- **TanStack Table** — server-side pagination, sorting, search, filters, column visibility, exports, bulk actions
- **Axios** — JWT auth with automatic single-flight refresh-token rotation
- **Recharts** — accessible, CVD-validated dashboard charts
- **Framer Motion, react-hot-toast, react-select, dayjs, react-icons**

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173 (proxies /api → :4000)
npm run build      # production build
```

Configure the API in `.env`:

```
VITE_API_URL=http://localhost:4000/api/v1
```

## Architecture notes

- `src/api/client.js` — axios instance; injects the Bearer token, transparently
  refreshes on 401 (queued single-flight), normalizes API errors, and unwraps the
  backend's uniform `{ success, data, meta }` envelope.
- `src/components/common/ResourcePage.jsx` — config-driven CRUD engine (list +
  filters + search + export + create/edit modal + delete confirm + bulk actions).
  Every standard module page is a declarative config on top of it.
- `src/services/resourceService.js` — service factory matching the backend REST
  convention (`page`, `limit`, `sort`, `search`, `/export`, `/import`). Modules the
  backend hasn't shipped yet render a graceful "module not available" state and
  activate automatically once their endpoints exist.
- RBAC: `useAuth().hasPermission('user:read')`, `<Can permission=…>`, and
  `<PermissionRoute>` gate UI, navigation and routes from the `permissions`
  array returned by `/auth/me`.

## Live vs. convention-wired modules

Fully wired to the current backend: **Auth (login, MFA, forgot/reset, sessions,
devices), Employees (users CRUD + roles + import/export), Roles & Permissions,
Audit Logs, Profile/Security, Dashboard & Analytics (computed from real data).**

Wired to the standard convention, pending backend rollout: departments,
designations, attendance, leaves, holidays, payroll, jobs, candidates,
interviews, onboarding, performance-reviews, goals, courses, assets, expenses,
tickets, documents, notifications, companies.
