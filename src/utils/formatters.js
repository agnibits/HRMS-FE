import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (value, fmt = 'MMM D, YYYY') =>
  value ? dayjs(value).format(fmt) : '—';

export const formatDateTime = (value) =>
  value ? dayjs(value).format('MMM D, YYYY h:mm A') : '—';

export const formatRelative = (value) => (value ? dayjs(value).fromNow() : '—');

export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));
};

export const formatNumber = (value) =>
  value === null || value === undefined ? '—' : new Intl.NumberFormat('en-US').format(value);

export const fullName = (obj) =>
  [obj?.firstName, obj?.lastName].filter(Boolean).join(' ') || obj?.name || '—';

export const initials = (nameOrObj) => {
  const name = typeof nameOrObj === 'string' ? nameOrObj : fullName(nameOrObj);
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
};

export const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const truncate = (s, n = 60) => {
  const str = String(s ?? '');
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
};
