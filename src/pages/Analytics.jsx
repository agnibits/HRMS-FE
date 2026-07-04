import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { LuShieldCheck, LuTrendingUp, LuUserRoundCheck, LuUsersRound } from 'react-icons/lu';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/cards/StatCard';
import { AreaTrendChart, BarsChart, DonutChart } from '@/components/charts/Charts';
import { Card } from '@/components/cards/Card';
import EmptyState from '@/components/common/EmptyState';
import { titleCase } from '@/utils/formatters';

export default function Analytics() {
  const { hasPermission } = useAuth();
  const canUsers = hasPermission('user:read');
  const canAudit = hasPermission('audit:read');

  const usersQuery = useQuery({
    queryKey: ['users', 'analytics'],
    queryFn: () => userService.list({ limit: 100, sort: '-createdAt' }),
    enabled: canUsers,
  });

  const rolesQuery = useQuery({
    queryKey: ['roles', 'analytics'],
    queryFn: () => roleService.list({ limit: 100 }),
    enabled: canUsers,
  });

  const auditQuery = useQuery({
    queryKey: ['audit-logs', 'analytics'],
    queryFn: () => auditService.list({ limit: 100, sort: '-createdAt' }),
    enabled: canAudit,
  });

  const users = usersQuery.data?.data || [];
  const totalUsers = usersQuery.data?.meta?.pagination?.total ?? users.length;

  const signupTrend = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => dayjs().subtract(11 - i, 'month').format('MMM'));
    const counts = Object.fromEntries(months.map((m) => [m, 0]));
    users.forEach((u) => {
      const key = dayjs(u.createdAt).format('MMM');
      if (key in counts) counts[key] += 1;
    });
    return months.map((m) => ({ label: m, value: counts[m] }));
  }, [users]);

  const roleDistribution = useMemo(() => {
    const counts = {};
    users.forEach((u) => (u.roles || []).forEach((r) => (counts[r.name] = (counts[r.name] || 0) + 1)));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ label: name, count: value }));
  }, [users]);

  const statusDistribution = useMemo(() => {
    const counts = {};
    users.forEach((u) => (counts[u.status] = (counts[u.status] || 0) + 1));
    const tones = { ACTIVE: 'green', PENDING: 'amber', SUSPENDED: 'orange', DISABLED: 'red' };
    return Object.entries(counts).map(([name, value]) => ({
      name: titleCase(name),
      value,
      tone: tones[name] || 'gray',
    }));
  }, [users]);

  const activityByDay = useMemo(() => {
    const logs = auditQuery.data?.data || [];
    const days = Array.from({ length: 14 }, (_, i) => dayjs().subtract(13 - i, 'day'));
    return days.map((d) => ({
      label: d.format('DD MMM'),
      value: logs.filter((l) => dayjs(l.createdAt).isSame(d, 'day')).length,
    }));
  }, [auditQuery.data]);

  const mfaAdoption = users.length
    ? Math.round((users.filter((u) => u.mfaEnabled).length / users.length) * 100)
    : 0;
  const activePct = users.length
    ? Math.round((users.filter((u) => u.status === 'ACTIVE').length / users.length) * 100)
    : 0;

  if (!canUsers) {
    return (
      <div>
        <PageHeader title="Analytics" description="Workforce insights and trends." />
        <Card>
          <EmptyState
            icon={LuShieldCheck}
            title="Analytics unavailable"
            description="Your role doesn't include access to workforce analytics."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Live workforce insights computed from real system data." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Workforce" value={totalUsers} icon={LuUsersRound} accent="primary" loading={usersQuery.isLoading} />
        <StatCard label="Active Rate" value={`${activePct}%`} icon={LuUserRoundCheck} accent="green" loading={usersQuery.isLoading} deltaLabel="of all accounts" />
        <StatCard label="2FA Adoption" value={`${mfaAdoption}%`} icon={LuShieldCheck} accent="violet" loading={usersQuery.isLoading} deltaLabel="of sampled accounts" />
        <StatCard label="Roles In Use" value={rolesQuery.data?.data?.length ?? '—'} icon={LuTrendingUp} accent="sky" loading={rolesQuery.isLoading} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AreaTrendChart
          title="Hiring trend"
          description="New accounts per month (last 12 months)"
          data={signupTrend}
          loading={usersQuery.isLoading}
          name="New accounts"
        />
        <BarsChart
          title="Employees by role"
          description="Top role assignments across the sampled workforce"
          data={roleDistribution}
          series={[{ key: 'count', name: 'Employees' }]}
          loading={usersQuery.isLoading || rolesQuery.isLoading}
        />
        <DonutChart
          title="Account status mix"
          description="Distribution of account states"
          data={statusDistribution}
          loading={usersQuery.isLoading}
        />
        {canAudit && (
          <AreaTrendChart
            title="System activity"
            description="Audited events per day (last 14 days)"
            data={activityByDay}
            loading={auditQuery.isLoading}
            name="Events"
          />
        )}
      </div>
    </div>
  );
}
