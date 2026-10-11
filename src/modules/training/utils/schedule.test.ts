import { describe, expect, it } from 'vitest';
import { schedule } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';

describe('schedule', () => {
  it('moves an overdue session to today and chains 2/2/3 gaps after it', () => {
    expect(schedule(fixtureSessions(), '2026-10-12')).toEqual({
      '52': '2026-10-12', '53': '2026-10-15', '54': '2026-10-17', '55': '2026-10-19',
      '56': '2026-10-22', '57': '2026-10-24', '58': '2026-10-26', '59': '2026-10-29',
      '60': '2026-10-31', '61': '2026-11-02',
    });
  });

  it('keeps a future due date when on schedule', () => {
    const due = schedule(fixtureSessions(), '2026-09-15');
    expect(due['52']).toBe('2026-09-16');
    expect(due['53']).toBe('2026-09-19');
  });

  it('counts from the latest training date, not the last in order', () => {
    const sessions = fixtureSessions().map((s) =>
      s._id === '52' ? { ...s, status: 'done' as const, loggedAt: '2026-09-12' } : s,
    );
    expect(schedule(sessions, '2026-09-15')['53']).toBe('2026-09-17');
  });

  it('starts today when nothing is logged', () => {
    const sessions = fixtureSessions().map((s) =>
      s.block === 'archive' ? s : { ...s, status: 'planned' as const, loggedAt: null },
    );
    expect(schedule(sessions, '2026-10-12')['50']).toBe('2026-10-12');
  });
});
