import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

/**
 * Shared date/time formatting helpers for the patient portal.
 *
 * Centralizes the `formatTime12h` helper that was previously duplicated in
 * BookAppointment.tsx and Appointments.tsx (audit UX-9) and provides a single
 * place to standardize date formats across the app. All functions are pure and
 * return '' for falsy input so callers can safely render the result.
 */

/** Format a "HH:mm" 24-hour string as "h:mm A" (e.g. "14:30" -> "2:30 PM"). */
export const formatTime12h = (hhmm: string): string => {
  if (!hhmm) return '';
  const d = dayjs(`2000-01-01 ${hhmm}`);
  return d.isValid() ? d.format('h:mm A') : hhmm;
};

/**
 * Format a date (Dayjs | string | Date) using a dayjs template.
 * Defaults to "MMM D, YYYY" (e.g. "Jan 5, 2026"). Returns '' for falsy input.
 */
export const formatDate = (
  date: Dayjs | string | Date | null | undefined,
  template = 'MMM D, YYYY',
): string => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format(template) : String(date);
};

/** Format a date + time together, e.g. "Jan 5, 2026 at 2:30 PM". */
export const formatDateTime = (
  date: Dayjs | string | Date | null | undefined,
  hhmm: string,
): string => {
  const datePart = formatDate(date);
  const timePart = formatTime12h(hhmm);
  if (!datePart) return timePart;
  if (!timePart) return datePart;
  return `${datePart} at ${timePart}`;
};

/**
 * Normalize a UTC-midnight date (e.g. an ISO "2026-01-05" stored at UTC midnight
 * by the backend) to a local Dayjs representing the same calendar day, so
 * timezone offsets do not shift the displayed date back/forward a day.
 * Returns null for falsy or invalid input.
 */
export const normalizeUTCDate = (
  date: Dayjs | string | Date | null | undefined,
): Dayjs | null => {
  if (!date) return null;
  const d = dayjs(date);
  return d.isValid() ? d : null;
};