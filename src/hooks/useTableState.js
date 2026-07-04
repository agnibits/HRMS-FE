import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useDebounce } from './useDebounce';

/**
 * Server-side table state: pagination, sorting, search, filters.
 * `queryParams` matches the backend list convention
 * (page, limit, sort e.g. "-createdAt,name", search, ...filters).
 */
export function useTableState(initial = {}) {
  const [page, setPage] = useState(initial.page || 1);
  const [limit, setLimit] = useState(initial.limit || DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState(initial.sorting || []); // TanStack format
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initial.filters || {});

  const debouncedSearch = useDebounce(search);

  const sortParam = useMemo(
    () => sorting.map((s) => `${s.desc ? '-' : ''}${s.id}`).join(',') || undefined,
    [sorting]
  );

  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== undefined && v !== null && v !== '' && v !== 'ALL'
        )
      ),
    [filters]
  );

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(sortParam ? { sort: sortParam } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...activeFilters,
    }),
    [page, limit, sortParam, debouncedSearch, activeFilters]
  );

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearch('');
    setPage(1);
  }, []);

  return {
    page, setPage,
    limit, setLimit: (l) => { setLimit(l); setPage(1); },
    sorting, setSorting,
    search, setSearch: onSearchChange,
    filters, setFilter, resetFilters,
    queryParams,
  };
}

export default useTableState;
