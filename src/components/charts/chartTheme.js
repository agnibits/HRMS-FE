import { useTheme } from '@/context/ThemeContext';

/**
 * Validated chart palettes (scripts/validate_palette.js — dataviz method):
 *  - light on #ffffff: PASS (aqua/yellow < 3:1 → relief via legends + direct labels)
 *  - dark on #0f172a: PASS all checks
 * Categorical slots are assigned in FIXED order — never cycled or re-ranked.
 */
const LIGHT = {
  series: ['#2a78d6', '#1baf7a', '#eda100', '#4a3aa7', '#e34948', '#008300'],
  sequential: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95'],
  ink: '#0f172a',
  inkSecondary: '#475569',
  inkMuted: '#94a3b8',
  grid: '#e2e8f0',
  axis: '#cbd5e1',
  surface: '#ffffff',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
};

const DARK = {
  series: ['#3987e5', '#199e70', '#c98500', '#9085e9', '#e66767', '#008300'],
  sequential: ['#0d366b', '#104281', '#184f95', '#1c5cab', '#2a78d6', '#3987e5'],
  ink: '#f1f5f9',
  inkSecondary: '#94a3b8',
  inkMuted: '#64748b',
  grid: '#1e293b',
  axis: '#334155',
  surface: '#0f172a',
  tooltipBg: '#172033',
  tooltipBorder: '#334155',
};

export function useChartTheme() {
  const { theme } = useTheme();
  return theme === 'dark' ? DARK : LIGHT;
}

export const tooltipStyle = (t) => ({
  contentStyle: {
    background: t.tooltipBg,
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: 10,
    fontSize: 12,
    color: t.ink,
    boxShadow: '0 8px 24px -6px rgb(2 6 23 / 0.25)',
  },
  labelStyle: { color: t.ink, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: t.inkSecondary, padding: 0 },
  cursor: { fill: t.grid, opacity: 0.35 },
});
