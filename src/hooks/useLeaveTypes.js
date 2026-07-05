import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveTypeService } from '@/services/modules';

/**
 * Company-configurable leave types. Reads /leave-types; if the company hasn't
 * defined any (or the endpoint isn't shipped yet), falls back to a sensible
 * default set so the Leave module always works. Once a company configures its
 * own policy, the request form and filters use those types automatically.
 */
const DEFAULTS = [
  { code: 'ANNUAL', name: 'Annual', color: '#3b82f6' },
  { code: 'SICK', name: 'Sick', color: '#ef4444' },
  { code: 'CASUAL', name: 'Casual', color: '#14b8a6' },
  { code: 'MATERNITY', name: 'Maternity', color: '#8b5cf6' },
  { code: 'PATERNITY', name: 'Paternity', color: '#a855f7' },
  { code: 'UNPAID', name: 'Unpaid', color: '#64748b' },
];

export function useLeaveTypes() {
  const query = useQuery({
    queryKey: ['leave-types', 'active'],
    queryFn: () => leaveTypeService.list({ limit: 100, status: 'ACTIVE', sort: 'name' }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const rows = query.data?.data;
  const isCustom = Array.isArray(rows) && rows.length > 0;
  const types = isCustom ? rows : DEFAULTS;

  const options = useMemo(
    () => types.map((t) => ({ value: t.code, label: t.name })),
    [types]
  );
  const codes = useMemo(() => types.map((t) => t.code), [types]);
  const colorByCode = useMemo(
    () => Object.fromEntries(types.map((t) => [t.code, t.color || '#64748b'])),
    [types]
  );

  return { types, options, codes, colorByCode, isCustom, isLoading: query.isLoading };
}

export default useLeaveTypes;
