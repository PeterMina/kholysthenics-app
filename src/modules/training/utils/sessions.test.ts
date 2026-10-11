import { describe, expect, it } from 'vitest';
import { archiveSessions, blockSessions, nextSession, previousLoggedSets } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';

describe('session selectors', () => {
  it('lists the block in order', () => {
    expect(blockSessions(fixtureSessions()).map((s) => s.day)).toEqual([50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]);
  });

  it('lists the journal newest first', () => {
    const archive = archiveSessions(fixtureSessions());
    expect(archive).toHaveLength(51);
    expect(archive[0]._id).toBe('h51');
  });

  it('finds the first unlogged block session', () => {
    expect(nextSession(fixtureSessions())?._id).toBe('52');
  });

  it('returns the last logged sets of a lift before a session', () => {
    expect(previousLoggedSets(fixtureSessions(), 'pullup', 5)).toEqual([
      { kg: 20, reps: 5 }, { kg: 20, reps: 5 }, { kg: 20, reps: 5 },
    ]);
    expect(previousLoggedSets(fixtureSessions(), 'squat', 3)).toBeNull();
  });
});
