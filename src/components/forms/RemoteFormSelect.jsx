import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormSelect } from './fields';

/**
 * A FormSelect whose options are loaded from a resource service — so reference
 * fields (employee, candidate, requester…) send a real record ID and let the
 * backend resolve the display name, instead of relying on free text.
 *
 * Self-contained (runs its own query) so it can be returned from a generic
 * field renderer without breaking the rules of hooks.
 */
export function RemoteFormSelect({
  form, name, label, required, hint, className, placeholder,
  service, params = {}, toOption, isMulti = false,
}) {
  const query = useQuery({
    queryKey: [service.resource, 'ref-options', params],
    queryFn: () => service.list({ limit: 100, sort: '-createdAt', ...params }),
    staleTime: 60_000,
    retry: false,
  });

  const options = useMemo(
    () => (query.data?.data || []).map(toOption),
    [query.data, toOption]
  );

  return (
    <FormSelect
      form={form}
      name={name}
      label={label}
      required={required}
      hint={query.isError ? 'Could not load options — type is unavailable.' : hint}
      className={className}
      options={options}
      isMulti={isMulti}
      isLoading={query.isLoading}
      placeholder={placeholder || 'Search…'}
    />
  );
}

export default RemoteFormSelect;
