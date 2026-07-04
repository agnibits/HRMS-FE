import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  LuUsersRound, LuUserRoundCheck, LuUserRoundX, LuClock, LuActivity, LuPlus, LuShieldCheck,
} from 'react-icons/lu';
import { userService } from '@/services/userService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/cards/StatCard';
import { AreaTrendChart, DonutChart } from '@/components/charts/Charts';
import { Card, CardHeader, CardBody } from '@/components/cards/Card';
import Timeline from '@/components/common/Timeline';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonText } from '@/components/common/Skeleton';
import Button from '@/components/common/Button';
import { fullName, titleCase } from '@/utils/formatters';
import { USER_STATUSES } from '@/constants';

const statusCountQuery = (status) => ({
  queryKey: ['users', 'count', status],
  queryFn: () => userService.list({ limit: 1, ...(status ? { status } : {}) }),
  select: (res) => res.meta?.pagination?.total ?? 0,
});

export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const canReadUsers = hasPermission('user:read');
  const canReadAudit = hasPermission('audit:read');

  const total = useQuery({ ...statusCountQuery(null), enabled: canReadUsers });
  const active = useQuery({ ...statusCountQuery('ACTIVE'), enabled: canReadUsers });
  const pending = useQuery({ ...statusCountQuery('PENDING'), enabled: canReadUsers });
  const suspended = useQuery({ ...statusCountQuery('SUSPENDED'), enabled: canReadUsers });
  const disabled = useQuery({ ...statusCountQuery('DISABLED'), enabled: canReadUsers });

  const recentUsers = useQuery({
    queryKey: ['users', 'recent'],
    queryFn: () => userService.list({ limit: 100, sort: '-createdAt' }),
    enabled: canReadUsers,
  });

  const recentActivity = useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: () => auditService.list({ limit: 8, sort: '-createdAt' }),
    enabled: canReadAudit,
  });

  // Bucket the latest signups by month for the trend chart
  const growthData = useMemo(() => {
    const rows = recentUsers.data?.data || [];
    const months = Array.from({ length: 6 }, (_, i) =>
      dayjs().subtract(5 - i, 'month').format('MMM YY')
    );
    const counts = Object.fromEntries(months.map((m) => [m, 0]));
    rows.forEach((u) => {
      const key = dayjs(u.createdAt).format('MMM YY');
      if (key in counts) counts[key] += 1;
    });
    return months.map((m) => ({ label: m, value: counts[m] }));
  }, [recentUsers.data]);

  const statusDistribution = useMemo(() => {
    const map = { ACTIVE: active.data, PENDING: pending.data, SUSPENDED: suspended.data, DISABLED: disabled.data };
    const tones = { ACTIVE: 'green', PENDING: 'amber', SUSPENDED: 'orange', DISABLED: 'red' };
    return USER_STATUSES.map((s) => ({ name: titleCase(s), value: map[s] || 0, tone: tones[s] }))
      .filter((d) => d.value > 0);
  }, [active.data, pending.data, suspended.data, disabled.data]);

  const activityItems = (recentActivity.data?.data || []).map((log) => ({
    id: log.id,
    title: `${titleCase(log.action)} · ${titleCase(log.entity)}`,
    description: log.entityId ? `Record ${log.entityId.slice(0, 12)}…` : undefined,
    timestamp: log.createdAt,
    color: log.status === 'FAILURE' ? 'red' : 'green',
  }));

  return (
    <div>
      <PageHeader
        breadcrumb={false}
        title={`Good ${dayjs().hour() < 12 ? 'morning' : dayjs().hour() < 17 ? 'afternoon' : 'evening'}, ${user?.firstName || 'there'} 👋`}
        description="Here's what's happening across your organization today."
        actions={
          canReadUsers && (
            <Button leftIcon={LuPlus} onClick={() => navigate('/employees')}>
              Add Employee
            </Button>
          )
        }
      />

      {canReadUsers ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Employees" value={total.data} icon={LuUsersRound} accent="primary" loading={total.isLoading} onClick={() => navigate('/employees')} />
            <StatCard label="Active" value={active.data} icon={LuUserRoundCheck} accent="green" loading={active.isLoading} />
            <StatCard label="Pending Invitations" value={pending.data} icon={LuClock} accent="amber" loading={pending.isLoading} />
            <StatCard label="Suspended / Disabled" value={(suspended.data || 0) + (disabled.data || 0)} icon={LuUserRoundX} accent="red" loading={suspended.isLoading || disabled.isLoading} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <AreaTrendChart
                title="New joiners"
                description="Employees added over the last 6 months"
                data={growthData}
                loading={recentUsers.isLoading}
                name="New joiners"
                height={300}
              />
            </div>
            <DonutChart
              title="Workforce by status"
              description="Current account states"
              data={statusDistribution}
              loading={active.isLoading || pending.isLoading}
              height={300}
            />
          </div>
        </>
      ) : (
        <Card>
          <EmptyState
            icon={LuShieldCheck}
            title="Welcome to your workspace"
            description="Your role doesn't include workforce analytics. Use the sidebar to access your available modules."
          />
        </Card>
      )}

      {canReadAudit && (
        <div className="mt-6 grid grid-cols-1 gap-6">
          <Card>
            <CardHeader
              title="Recent activity"
              description="Latest audited events across the system"
              actions={
                <Button variant="ghost" size="sm" leftIcon={LuActivity} onClick={() => navigate('/audit-logs')}>
                  View all
                </Button>
              }
            />
            <CardBody>
              {recentActivity.isLoading ? (
                <SkeletonText lines={5} />
              ) : activityItems.length ? (
                <Timeline items={activityItems} />
              ) : (
                <EmptyState title="No activity yet" description="Audited events will appear here." className="py-4" />
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
