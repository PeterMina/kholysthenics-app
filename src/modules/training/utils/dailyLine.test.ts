import { describe, expect, it } from 'vitest';
import { DAILY_LINES, dailyLine } from '@/modules/training';

describe('dailyLine', () => {
  it('gives the same line all day and a different one tomorrow', () => {
    const morning = dailyLine(new Date(2026, 9, 22, 6, 0));
    const night = dailyLine(new Date(2026, 9, 22, 23, 59));
    const tomorrow = dailyLine(new Date(2026, 9, 23, 6, 0));
    expect(morning).toEqual(night);
    expect(tomorrow).not.toEqual(morning);
  });

  it('walks the whole list and comes back round', () => {
    const start = new Date(2026, 9, 22);
    const seen = Array.from({ length: DAILY_LINES.length }, (_, i) =>
      dailyLine(new Date(2026, 9, 22 + i)).text,
    );
    expect(new Set(seen).size).toBe(DAILY_LINES.length);
    expect(dailyLine(new Date(2026, 9, 22 + DAILY_LINES.length))).toEqual(dailyLine(start));
  });

  it('does not repeat across a daylight-saving change', () => {
    // clocks move on 25 Oct 2026; a local day is then 25 hours
    const around = [23, 24, 25, 26, 27].map((d) => dailyLine(new Date(2026, 9, d)).text);
    expect(new Set(around).size).toBe(around.length);
  });

  it('handles dates before the epoch without a negative index', () => {
    expect(DAILY_LINES).toContainEqual(dailyLine(new Date(1969, 0, 1)));
  });

  it('never attributes a line to Kholy', () => {
    expect(DAILY_LINES.some((l) => /kholy/i.test(l.source))).toBe(false);
  });
});
