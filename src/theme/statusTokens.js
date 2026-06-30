/**
 * Shared appointment status and formatting tokens used across the patient portal.
 *
 * Keeping these definitions in one place guarantees that filter pills, card badges,
 * dashboard accents, and any future status UI all speak the same color/language system.
 */

export const STATUS_META = {
  Waiting: {
    label: 'Upcoming',
    muiColor: 'warning',
    fg: '#92400E', // amber-800
    bg: '#FFFBEB', // amber-50
    softBg: 'rgba(245, 158, 11, 0.12)',
  },
  'In Consultation': {
    label: 'In Consultation',
    muiColor: 'info',
    fg: '#1E40AF', // blue-800
    bg: '#EFF6FF', // blue-50
    softBg: 'rgba(59, 130, 246, 0.12)',
  },
  Completed: {
    label: 'Completed',
    muiColor: 'success',
    fg: '#166534', // green-800
    bg: '#F0FDF4', // green-50
    softBg: 'rgba(34, 197, 94, 0.12)',
  },
  Cancelled: {
    label: 'Cancelled',
    muiColor: 'error',
    fg: '#991B1B', // red-800
    bg: '#FEF2F2', // red-50
    softBg: 'rgba(239, 68, 68, 0.12)',
  },
};

export const STATUS_ORDER = ['Waiting', 'In Consultation', 'Completed', 'Cancelled'];

/**
 * Returns true for appointments that are still active/upcoming.
 */
export const isUpcomingStatus = (status) =>
  status === 'Waiting' || status === 'In Consultation';

/**
 * Returns true for appointments that are historically concluded.
 */
export const isPastStatus = (status) =>
  status === 'Completed' || status === 'Cancelled';

/**
 * Sanitize and format a free-text appointment reason for display.
 * - Trims leading/trailing whitespace.
 * - Collapses multiple spaces.
 * - If the text is typed in ALL CAPS (which reads as shouting and is harder
 *   to read, especially for older adults), restyles it to sentence case.
 * - Otherwise, sentence-cases only the first character (preserves proper
 *   nouns, dosages, etc. that mix case intentionally).
 * - Truncates to `maxLength` with an ellipsis when too long.
 */
export const formatReason = (reason, maxLength = 120) => {
  if (!reason || typeof reason !== 'string') return '';
  const cleaned = reason.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const hasLetters = /[a-zA-Z]/.test(cleaned);
  const isAllCaps = hasLetters && cleaned === cleaned.toUpperCase();
  const base = isAllCaps
    ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
    : cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (base.length <= maxLength) return base;
  return `${base.slice(0, maxLength).trim()}…`;
};

/**
 * Format a status label into a sentence-cased, trimmed string.
 */
export const formatStatusLabel = (status) => {
  if (!status) return '';
  const label = STATUS_META[status]?.label || status;
  return label.trim();
};
