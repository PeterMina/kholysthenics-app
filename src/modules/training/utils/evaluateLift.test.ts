import { describe, expect, it } from 'vitest';
import { evaluateLift, type SetEntry } from '@/modules/training';
import type { Lift } from '@/shared/validators';

const pullup: Lift = {
  key: 'pullup', name: 'Weighted pull ups', load: 25, sets: 3, repMin: 3, repMax: 5,
  best: 40, increment: 2.5, incrementFast: 5,
};
const squat: Lift = {
  key: 'squat', name: 'Squat', load: 20, sets: 3, repMin: 12, repMax: 20,
  best: null, maxLoad: 20, progress: 'reps',
};
const sets = (reps: number[], kg: number | null = 25): SetEntry[] => reps.map((r) => ({ reps: r, kg }));

describe('evaluateLift', () => {
  it('waits until every set has reps', () => {
    const verdict = evaluateLift(pullup, [{ reps: 5, kg: 25 }, { reps: null, kg: 25 }, { reps: null, kg: 25 }], null);
    expect(verdict.state).toBe('pending');
    expect(verdict.message).toBe('1 of 3 sets entered.');
  });

  it('adds the fast jump below the best', () => {
    const verdict = evaluateLift(pullup, sets([5, 5, 5]), null);
    expect(verdict).toMatchObject({ state: 'up', kgUsed: 25, nextLoad: 30, label: '+5 kg' });
  });

  it('adds the slow jump at or above the best', () => {
    expect(evaluateLift(pullup, sets([5, 5, 5], 40), null)).toMatchObject({ state: 'up', nextLoad: 42.5 });
  });

  it('judges by the lowest load used', () => {
    const verdict = evaluateLift(pullup, [{ reps: 5, kg: 25 }, { reps: 5, kg: 25 }, { reps: 5, kg: 22.5 }], null);
    expect(verdict.kgUsed).toBe(22.5);
    expect(verdict.nextLoad).toBe(27.5);
  });

  it('null kg falls back to the planned load', () => {
    const verdict = evaluateLift(pullup, sets([5, 5, 5], null), null);
    expect(verdict.kgUsed).toBe(25);
    expect(verdict.nextLoad).toBe(30);
  });

  it('never adds load to a capped lift', () => {
    const verdict = evaluateLift(squat, sets([20, 20, 20], 20), null);
    expect(verdict).toMatchObject({ state: 'cap', nextLoad: null });
    expect(verdict.message).toContain('pistol ladder');
  });

  it('holds when in range', () => {
    expect(evaluateLift(pullup, sets([5, 4, 4]), null)).toMatchObject({ state: 'hold', nextLoad: null });
  });

  it('warns after one miss', () => {
    const verdict = evaluateLift(pullup, sets([4, 3, 2]), null);
    expect(verdict.state).toBe('hold');
    expect(verdict.message).toContain('A second miss in a row drops one step.');
  });

  it('drops one step after two misses in a row', () => {
    const verdict = evaluateLift(pullup, sets([4, 3, 2]), [{ reps: 2, kg: 25 }, { reps: 3, kg: 25 }, { reps: 3, kg: 25 }]);
    expect(verdict).toMatchObject({ state: 'drop', nextLoad: 22.5 });
  });

  it('never drops a capped lift', () => {
    const verdict = evaluateLift(squat, sets([10, 10, 10], 20), [{ reps: 10, kg: 20 }, { reps: 11, kg: 20 }, { reps: 11, kg: 20 }]);
    expect(verdict.state).toBe('hold');
  });

  it('treats a bodyweight lift as zero added kg', () => {
    const verdict = evaluateLift({ ...pullup, bodyweight: true }, sets([5, 5, 5], null), null);
    expect(verdict.kgUsed).toBe(0);
  });
});
