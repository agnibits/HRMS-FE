/**
 * Company leave policy — annual entitlement (days) per leave type.
 * The Leave Balance engine accrues against these. When the backend ships a
 * per-company policy endpoint, this becomes the fallback default.
 */
export const LEAVE_POLICY = {
  ANNUAL: 20,
  SICK: 10,
  CASUAL: 7,
  MATERNITY: 90,
  PATERNITY: 10,
  UNPAID: 0,
};

/** Types that count toward a paid-leave balance (shown in the balance view). */
export const TRACKED_LEAVE_TYPES = [
  { key: 'ANNUAL', label: 'Annual', tone: 'blue' },
  { key: 'SICK', label: 'Sick', tone: 'red' },
  { key: 'CASUAL', label: 'Casual', tone: 'amber' },
];

export const PAID_ENTITLEMENT = TRACKED_LEAVE_TYPES.reduce(
  (sum, t) => sum + (LEAVE_POLICY[t.key] || 0),
  0
);
