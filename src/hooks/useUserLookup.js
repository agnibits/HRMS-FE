import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { fullName } from '@/utils/formatters';

/**
 * Resolves user IDs to names for reference columns (buddy, manager, assignee…).
 * Backend-resolved *Name fields are preferred by callers; this is the fallback
 * so raw cuids never show. Cached; fine for SMB tenants — for very large orgs
 * the backend should return the resolved name alongside the id.
 */
export function useUserLookup() {
  const query = useQuery({
    queryKey: ['users', 'lookup'],
    queryFn: () => userService.list({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const map = useMemo(() => {
    const m = {};
    (query.data?.data || []).forEach((u) => {
      m[u.id] = fullName(u);
    });
    return m;
  }, [query.data]);

  /** Returns the display name for an id (or the value itself if already a name / unknown). */
  const nameOf = (value) => (value ? map[value] || value : '—');

  return { nameOf, map, isLoading: query.isLoading };
}

export default useUserLookup;
