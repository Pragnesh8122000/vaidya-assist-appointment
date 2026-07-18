import { describe, it, expect } from 'vitest';
import { formatTime12h, formatDate, formatDateTime } from './dateFormat';

describe('dateFormat', () => {
  describe('formatTime12h', () => {
    it('converts 24-hour strings to 12-hour format', () => {
      expect(formatTime12h('14:30')).toBe('2:30 PM');
      expect(formatTime12h('09:00')).toBe('9:00 AM');
      expect(formatTime12h('00:00')).toBe('12:00 AM');
    });

    it('returns empty string for falsy input', () => {
      expect(formatTime12h('')).toBe('');
      expect(formatTime12h(undefined as unknown as string)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates with the default template', () => {
      expect(formatDate('2026-01-15')).toBe('Jan 15, 2026');
    });

    it('accepts custom templates', () => {
      expect(formatDate('2026-01-15', 'YYYY-MM-DD')).toBe('2026-01-15');
    });

    it('returns empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('combines date and time', () => {
      expect(formatDateTime('2026-01-15', '14:30')).toBe('Jan 15, 2026 at 2:30 PM');
    });

    it('falls back gracefully when one part is missing', () => {
      expect(formatDateTime(null, '14:30')).toBe('2:30 PM');
      expect(formatDateTime('2026-01-15', '')).toBe('Jan 15, 2026');
    });
  });
});
