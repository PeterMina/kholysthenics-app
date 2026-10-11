import { describe, expect, it } from 'vitest';
import { reconcileDraft, type LogDraft } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';
import type { Session } from '@/shared/validators';

const day54 = (): Session => {
  const session = fixtureSessions().find((s) => s._id === '54');
  if (!session) throw new Error('fixture');
  return session;
};

const stored: LogDraft = {
  lifts: { pullup: [{ reps: 5, kg: 25 }, { reps: 4, kg: 25 }, { reps: null, kg: 25 }] },
  done: { '0': true },
  notes: 'kept',
  date: '2026-10-12',
};

describe('reconcileDraft', () => {
  it('pads a lift whose set count grew and adds a new lift, keeping what was entered', () => {
    const base = day54();
    const changed: Session = {
      ...base,
      lifts: [{ ...base.lifts[0], sets: 4 }, { ...base.lifts[0], key: 'dip', name: 'Weighted dips', load: 20 }],
    };
    const result = reconcileDraft(stored, changed);
    expect(result.lifts.pullup).toEqual([...stored.lifts.pullup, { reps: null, kg: 25 }]);
    expect(result.lifts.dip).toEqual([{ reps: null, kg: 20 }, { reps: null, kg: 20 }, { reps: null, kg: 20 }]);
    expect(result).toMatchObject({ done: { '0': true }, notes: 'kept', date: '2026-10-12' });
  });

  it('trims a lift whose set count shrank', () => {
    const base = day54();
    const changed: Session = { ...base, lifts: [{ ...base.lifts[0], sets: 2 }] };
    expect(reconcileDraft(stored, changed).lifts.pullup).toEqual(stored.lifts.pullup.slice(0, 2));
  });
});
