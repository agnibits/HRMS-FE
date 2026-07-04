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

/** Single-series area trend — brand accent, one hue for one measure. */
export function AreaTrendChart({ title, description, data, dataKey = 'value', xKey = 'label', loading, height, name }) {
  const t = useChartTheme();
  const color = t.accent;
  return (
    <ChartFrame title={title} description={description} loading={loading} isEmpty={!data?.length} height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={t.grid} strokeDasharray="3 6" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps(t)} dy={6} />
        <YAxis {...axisProps(t)} allowDecimals={false} width={44} />
        <Tooltip {...tooltipStyle(t)} cursor={{ stroke: t.axis, strokeDasharray: '3 3' }} />
        <Area
          type="monotone"
          name={name || title}
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill={`url(#grad-${dataKey})`}
          dot={false}
          activeDot={{ r: 4.5, fill: color, stroke: t.surface, strokeWidth: 2.5 }}
        />
      </AreaChart>
    </ChartFrame>
  );
}

/** Vertical bars; series: [{ key, name }] — single series wears the brand accent, multi-series the fixed categorical order. */
export function BarsChart({ title, description, data, series, xKey = 'label', loading, height, stacked = false }) {
  const t = useChartTheme();
  const fillFor = (i) => (series.length === 1 ? t.accent : t.series[i % t.series.length]);
  return (
    <ChartFrame title={title} description={description} loading={loading} isEmpty={!data?.length} height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -16 }} barCategoryGap="40%">
        <CartesianGrid stroke={t.grid} strokeDasharray="3 6" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps(t)} dy={6} />
        <YAxis {...axisProps(t)} allowDecimals={false} width={44} />
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
            fill={fillFor(i)}
            radius={stacked && i < series.length - 1 ? 0 : [6, 6, 0, 0]}
            stroke={t.surface}
            strokeWidth={stacked ? 2 : 0}
            maxBarSize={32}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

/**
 * Donut for composition; data: [{ name, value, tone? }].
 * `tone` maps to the semantic palette (green/amber/orange/red/blue/violet/gray)
 * so status charts match the StatusChip colors; without tones it falls back to
 * the categorical series. Legend carries values + share bars (relief rule).
 */
export function DonutChart({ title, description, data = [], loading, height = 280 }) {
  const t = useChartTheme();
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const colorOf = (d, i) => (d.tone && t.tones[d.tone]) || t.series[i % t.series.length];
  const single = data.length === 1;

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="flex flex-col items-center gap-6 px-6 py-5 sm:flex-row" style={{ minHeight: height }}>
        {loading ? (
          <div className="flex w-full items-center justify-center py-8">
            <Skeleton className="size-40 rounded-full" />
          </div>
        ) : !data.length || total === 0 ? (
          <EmptyState title="No data to display" className="w-full py-6" />
        ) : (
          <>
            <div className="relative h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip {...tooltipStyle(t)} formatter={(v, n) => [formatNumber(v), n]} />
                  {/* Muted full-circle track behind the data ring */}
                  <Pie
                    data={[{ value: 1 }]}
                    dataKey="value"
                    innerRadius="78%"
                    outerRadius="92%"
                    fill={t.track}
                    stroke="none"
                    isAnimationActive={false}
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="78%"
                    outerRadius="92%"
                    paddingAngle={single ? 0 : 3}
                    cornerRadius={8}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.map((d, i) => (
                      <Cell key={i} fill={colorOf(d, i)} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
                  {formatNumber(total)}
                </span>
                <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-surface-400">
                  Total
                </span>
              </div>
            </div>

            <ul className="w-full min-w-0 grow divide-y divide-surface-100 dark:divide-surface-800">
              {data.map((d, i) => {
                const pct = total ? Math.round((d.value / total) * 100) : 0;
                const color = colorOf(d, i);
                return (
                  <li key={d.name} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
                    <span className="w-24 shrink-0 truncate font-medium text-surface-700 dark:text-surface-200">
                      {d.name}
                    </span>
                    <span className="h-1 min-w-0 grow overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </span>
                    <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-surface-900 dark:text-surface-100">
                      {formatNumber(d.value)}
                    </span>
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-surface-400">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}
