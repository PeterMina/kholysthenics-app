import { describe, expect, it } from 'vitest';
import { SESSIONS_STALE_MS, sessionsQueryOptions, type SessionsSnapshot } from '@/modules/training';

type StaleTime = (query: { state: { data: SessionsSnapshot | undefined } }) => number;

const staleTimeFor = (data: SessionsSnapshot): number => {
  const { staleTime } = sessionsQueryOptions();
  if (typeof staleTime !== 'function') throw new Error('staleTime must depend on the snapshot');
  return (staleTime as unknown as StaleTime)({ state: { data } });
};

describe('sessionsQueryOptions', () => {
  it('treats a snapshot with waiting changes as stale, so reconnect and refocus sync at once', () => {
    expect(staleTimeFor({ sessions: [], pendingCount: 1, problem: { kind: 'network', message: 'x' }, syncedAt: null })).toBe(0);
  });

  it('treats a snapshot with a sync problem as stale', () => {
    expect(staleTimeFor({ sessions: [], pendingCount: 0, problem: { kind: 'network', message: 'x' }, syncedAt: null })).toBe(0);
  });

  it('keeps a clean sync fresh for the normal window', () => {
    expect(staleTimeFor({ sessions: [], pendingCount: 0, problem: null, syncedAt: '2026-10-12T10:00:00Z' })).toBe(SESSIONS_STALE_MS);
  });
});
