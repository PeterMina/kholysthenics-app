import { describe, expect, it } from 'vitest';
import { addDays, toIsoDate } from '@/shared/utils';

describe('dates', () => {
  it('adds days within and across months', () => {
    expect(addDays('2026-09-14', 2)).toBe('2026-09-16');
    expect(addDays('2026-09-30', 2)).toBe('2026-10-02');
  });

  it('is not shifted by a daylight-saving change', () => {
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
  });

  it('formats a local date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
