import { describe, expect, it } from 'vitest';
import { syncStatusText } from '@/modules/training';

describe('syncStatusText', () => {
  it('says synced when all is well', () => {
    expect(syncStatusText({ sessions: [], pendingCount: 0, problem: null, syncedAt: '2026-10-12T10:00:00Z' })).toEqual({ tone: 'ok', text: 'Synced with GitHub.' });
  });

  it('counts waiting changes when offline', () => {
    const status = syncStatusText({ sessions: [], pendingCount: 2, problem: { kind: 'network', message: 'x' }, syncedAt: null });
    expect(status).toEqual({ tone: 'waiting', text: "2 changes saved on this phone. They will sync when you're online." });
  });

  it('shows the problem otherwise', () => {
    const status = syncStatusText({ sessions: [], pendingCount: 0, problem: { kind: 'auth', message: 'Paste a new one.' }, syncedAt: null });
    expect(status).toEqual({ tone: 'problem', text: 'Paste a new one.' });
  });
});
