import { describe, expect, it } from 'vitest';
import { draftKey, emptyDraft } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';

describe('emptyDraft', () => {
  it('prefills one row per set with the planned load and no reps', () => {
    const day54 = fixtureSessions().find((s) => s._id === '54');
    if (!day54) throw new Error('fixture');
    expect(emptyDraft(day54, '2026-10-12')).toEqual({
      lifts: { pullup: [{ reps: null, kg: 25 }, { reps: null, kg: 25 }, { reps: null, kg: 25 }] },
      done: {},
      notes: '',
      date: '2026-10-12',
    });
  });

  it('uses zero kg for bodyweight lifts', () => {
    const day54 = fixtureSessions().find((s) => s._id === '54');
    if (!day54) throw new Error('fixture');
    const bodyweight = { ...day54, lifts: day54.lifts.map((l) => ({ ...l, bodyweight: true })) };
    expect(emptyDraft(bodyweight, '2026-10-12').lifts.pullup[0].kg).toBe(0);
  });

  it('keys drafts per session', () => {
    expect(draftKey('52')).toBe('kh.draft.52');
  });
});
