import { describe, expect, it } from 'vitest';
import { nextSession, schedule, skipSession, skippedSessions } from '@/modules/training';
import type { Session } from '@/shared/validators';

const session = (over: Partial<Session> & Pick<Session, '_id' | 'day' | 'order'>): Session =>
  ({
    type: 'Legs', week: 2, block: '50-61', status: 'planned', loggedAt: null,
    lifts: [], work: [], log: {}, ...over,
  }) as Session;

const base: Session[] = [
  session({ _id: '53', day: 53, order: 4, type: 'Push', status: 'done', loggedAt: '2026-10-26' }),
  session({ _id: '54', day: 54, order: 5, type: 'Legs' }),
  session({ _id: '55', day: 55, order: 6, type: 'Supersets' }),
];

describe('skipSession', () => {
  it('marks it skipped with the date and the reason', () => {
    const { upserts, message } = skipSession(base, '54', '  knee  ', '2026-10-31');
    expect(upserts).toHaveLength(1);
    expect(upserts[0]).toMatchObject({ _id: '54', status: 'skipped', skippedAt: '2026-10-31', skipReason: 'knee' });
    expect(message).toBe('chore(log): day 54 legs skipped — knee');
  });

  it('leaves every other session untouched — a skip moves no weight', () => {
    const { upserts } = skipSession(base, '54', 'knee', '2026-10-31');
    expect(upserts.map((s) => s._id)).toEqual(['54']);
  });

  it('takes the session out of the queue so the next one is up', () => {
    const after = base.map((s) => (s._id === '54' ? skipSession(base, '54', 'knee', '2026-10-31').upserts[0]! : s));
    expect(nextSession(base)?._id).toBe('54');
    expect(nextSession(after)?._id).toBe('55');
    expect(skippedSessions(after).map((s) => s._id)).toEqual(['54']);
  });

  it('does not anchor the rhythm: the gap still runs from the last logged session', () => {
    const after = base.map((s) => (s._id === '54' ? skipSession(base, '54', 'knee', '2026-11-20').upserts[0]! : s));
    const due = schedule(after, '2026-10-31');
    expect(due['54']).toBeUndefined();
    expect(due['55']).toBe('2026-10-31'); // clamped to today, not pushed out by the skip date
  });

  it('warns once a second session of the same type goes', () => {
    const after = base.map((s) => (s._id === '54' ? skipSession(base, '54', 'knee', '2026-10-31').upserts[0]! : s));
    const withAnother = [...after, session({ _id: '58', day: 58, order: 9, type: 'Legs' })];
    expect(skipSession(withAnother, '58', 'knee again', '2026-11-05').notices)
      .toEqual(['That is 2 legs sessions skipped in this block.']);
  });

  it('refuses an empty reason, a logged session, and a double skip', () => {
    expect(() => skipSession(base, '54', '   ', '2026-10-31')).toThrow(/why you are skipping/);
    expect(() => skipSession(base, '53', 'knee', '2026-10-31')).toThrow(/already logged/);
    const after = base.map((s) => (s._id === '54' ? skipSession(base, '54', 'knee', '2026-10-31').upserts[0]! : s));
    expect(() => skipSession(after, '54', 'knee', '2026-11-01')).toThrow(/already skipped/);
  });
});
