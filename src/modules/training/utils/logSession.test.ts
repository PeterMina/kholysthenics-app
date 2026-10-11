import { describe, expect, it } from 'vitest';
import { logSession, LogValidationError, type LogDraft } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';

const TODAY = '2026-10-12';
const draft = (lifts: LogDraft['lifts'], extra: Partial<LogDraft> = {}): LogDraft => ({
  lifts, done: {}, notes: '', date: TODAY, ...extra,
});
const reps = (values: number[], kg: number): { reps: number; kg: number }[] => values.map((r) => ({ reps: r, kg }));

describe('logSession', () => {
  it('logs a capped squat without touching other sessions', () => {
    const change = logSession(fixtureSessions(), '52', draft({ squat: reps([20, 20, 20], 20) }, { notes: 'Felt good', done: { '0': true } }), TODAY);
    expect(change.upserts.map((s) => s._id)).toEqual(['52']);
    expect(change.message).toBe('chore(log): day 52 legs — squat 20/20/20 @ 20kg');
    const logged = change.upserts[0];
    expect(logged).toMatchObject({ status: 'done', loggedAt: TODAY, applied: [] });
    expect(logged.log).toEqual({ lifts: { squat: reps([20, 20, 20], 20) }, done: { '0': true }, notes: 'Felt good' });
  });

  it('raises the next sessions of the lift and records it', () => {
    const change = logSession(fixtureSessions(), '54', draft({ pullup: reps([5, 5, 5], 25) }), TODAY);
    const ids = change.upserts.map((s) => s._id).sort();
    expect(ids).toEqual(['54', '58']);
    const day58 = change.upserts.find((s) => s._id === '58');
    expect(day58?.lifts[0].load).toBe(30);
    expect(change.upserts.find((s) => s._id === '54')?.applied).toEqual([
      { id: '58', key: 'pullup', field: 'load', from: 25, to: 30 },
    ]);
    expect(change.notices).toContain('Weighted pull ups: next 1 session set to +30 kg.');
  });

  it('raises best everywhere when beaten', () => {
    const change = logSession(fixtureSessions(), '54', draft({ pullup: reps([5, 5, 5], 42.5) }), TODAY);
    const bests = change.upserts.filter((s) => s.lifts.some((l) => l.key === 'pullup')).map((s) => [s._id, s.lifts[0].best]);
    expect(bests.sort()).toEqual([['50', 42.5], ['54', 42.5], ['58', 42.5]]);
    expect(change.upserts.find((s) => s._id === '58')?.lifts[0].load).toBe(45);
    expect(change.notices).toContain('New best: weighted pull ups +42.5 kg.');
  });

  it('keeps the original key order and appends applied', () => {
    const original = fixtureSessions().find((s) => s._id === '54');
    const change = logSession(fixtureSessions(), '54', draft({ pullup: reps([5, 4, 4], 25) }), TODAY);
    const logged = change.upserts.find((s) => s._id === '54');
    expect(Object.keys(logged ?? {})).toEqual([...Object.keys(original ?? {}), 'applied']);
  });

  it('refuses missing reps, a future date and a logged session', () => {
    const sessions = fixtureSessions();
    expect(() => logSession(sessions, '54', draft({ pullup: [{ reps: 5, kg: 25 }] }), TODAY)).toThrow(LogValidationError);
    expect(() => logSession(sessions, '54', draft({ pullup: reps([5, 5, 5], 25) }, { date: '2026-10-13' }), TODAY)).toThrow("can't be in the future");
    expect(() => logSession(sessions, '50', draft({ pullup: reps([5, 5, 5], 25) }), TODAY)).toThrow('already logged');
  });
});
