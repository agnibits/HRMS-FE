import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Card, CardHeader } from '@/components/cards/Card';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { useChartTheme, tooltipStyle } from './chartTheme';
import { formatNumber } from '@/utils/formatters';

function ChartFrame({ title, description, actions, loading, isEmpty, height = 280, children }) {
  return (
    <Card>
      <CardHeader title={title} description={description} actions={actions} />
      <div className="p-4" style={{ height }}>
        {loading ? (
          <div className="flex h-full flex-col justify-end gap-2 p-4">
            <Skeleton className="h-2/3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : isEmpty ? (
          <EmptyState title="No data to display" description="Data will appear here as it becomes available." className="py-6" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

const axisProps = (t) => ({
  stroke: t.axis,
  tick: { fill: t.inkMuted, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: t.axis },
});

/** Single-series area trend (sequential blue — one hue for one measure). */
export function AreaTrendChart({ title, description, data, dataKey = 'value', xKey = 'label', loading, height, name }) {
  const t = useChartTheme();
  const color = t.series[0];
  return (
    <ChartFrame title={title} description={description} loading={loading} isEmpty={!data?.length} height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={t.grid} strokeDasharray="0" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps(t)} />
        <YAxis {...axisProps(t)} allowDecimals={false} />
        <Tooltip {...tooltipStyle(t)} />
        <Area
          type="monotone"
          name={name || title}
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          activeDot={{ r: 4, stroke: t.surface, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartFrame>
  );
}

/** Vertical bars; series: [{ key, name }] — fixed categorical slot order. */
export function BarsChart({ title, description, data, series, xKey = 'label', loading, height, stacked = false }) {
  const t = useChartTheme();
  return (
    <ChartFrame title={title} description={description} loading={loading} isEmpty={!data?.length} height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="35%">
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps(t)} />
        <YAxis {...axisProps(t)} allowDecimals={false} />
        <Tooltip {...tooltipStyle(t)} />
        {series.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 12, color: t.inkSecondary }} iconType="circle" iconSize={8} />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId={stacked ? 'stack' : undefined}
            fill={t.series[i % t.series.length]}
            radius={stacked && i < series.length - 1 ? 0 : [4, 4, 0, 0]}
            stroke={t.surface}
            strokeWidth={stacked ? 2 : 0}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

/** Donut for composition; data: [{ name, value }]. Legend carries values (relief rule). */
export function DonutChart({ title, description, data = [], loading, height = 280 }) {
  const t = useChartTheme();
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="flex flex-col items-center gap-2 p-4 sm:flex-row" style={{ minHeight: height }}>
        {loading ? (
          <div className="flex w-full items-center justify-center py-8">
            <Skeleton className="size-40 rounded-full" />
          </div>
        ) : !data.length || total === 0 ? (
          <EmptyState title="No data to display" className="w-full py-6" />
        ) : (
          <>
            <div className="relative h-52 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip {...tooltipStyle(t)} formatter={(v, n) => [formatNumber(v), n]} />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="90%"
                    paddingAngle={2}
                    stroke={t.surface}
                    strokeWidth={2}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={t.series[i % t.series.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {formatNumber(total)}
                </span>
                <span className="text-xs text-surface-400">total</span>
              </div>
            </div>
            <ul className="w-full space-y-2 sm:w-1/2">
              {data.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2.5 text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: t.series[i % t.series.length] }} />
                  <span className="grow truncate text-surface-600 dark:text-surface-300">{d.name}</span>
                  <span className="font-semibold text-surface-900 dark:text-surface-100">{formatNumber(d.value)}</span>
                  <span className="w-10 text-right text-xs text-surface-400">
                    {total ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
