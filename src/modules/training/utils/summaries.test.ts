import { describe, expect, it } from 'vitest';
import { liftSummary } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';
import type { Session } from '@/shared/validators';

const byId = (id: string): Session => {
  const session = fixtureSessions().find((s) => s._id === id);
  if (!session) throw new Error(id);
  return session;
};

describe('liftSummary', () => {
  it('shows what was hit for a logged session', () => {
    expect(liftSummary(byId('50'))).toEqual(['Weighted pull ups · 5/5/5 @ +20']);
  });

  it('shows the plan for an upcoming session', () => {
    expect(liftSummary(byId('54'))).toEqual(['Weighted pull ups · 3×3–5 @ +25']);
  });

  it('falls back to the skill when there is no tracked lift', () => {
    expect(liftSummary(byId('53'))).toEqual(['Wall handstand hold']);
  });
});
