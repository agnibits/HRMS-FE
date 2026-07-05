import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/authSlice';
import { companyService } from '@/services/modules';

/**
 * The logged-in tenant's company (for white-label branding).
 * Prefers company info embedded on the auth user (no extra request); falls
 * back to fetching the tenant's own company. Returns null until available so
 * callers can degrade to the platform name.
 */
export function useCurrentCompany() {
  const user = useSelector(selectUser);
  const fromAuth = user?.company; // { id, name, logoUrl } if the backend embeds it in /auth/me

  const query = useQuery({
    queryKey: ['company', 'current'],
    queryFn: () => companyService.list({ limit: 1 }),
    enabled: !!user && !fromAuth,
    retry: false,
    staleTime: 10 * 60 * 1000,
    select: (res) => res.data?.[0] || null,
  });

  return { company: fromAuth || query.data || null };
}

export default useCurrentCompany;
