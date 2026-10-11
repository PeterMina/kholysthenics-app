// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enqueuePending, loadSessions, readPending, writeCachedSessions, type SyncDeps } from '@/modules/training';
import { GitHubError } from '@/shared/services';
import { SessionsFileError } from '@/shared/utils';
import { fixtureSessions } from '@/shared/testing';
import type { Session } from '@/shared/validators';

const done = (id: string): Session => {
  const base = fixtureSessions().find((s) => s._id === id);
  if (!base) throw new Error(`no fixture ${id}`);
  return { ...base, status: 'done', loggedAt: '2026-10-12' };
};
const failing = (error: Error): SyncDeps => ({
  fetchFile: vi.fn(async () => {
    throw error;
  }),
  putFile: vi.fn(),
});

beforeEach(() => localStorage.clear());

describe('loadSessions', () => {
  it('syncs, caches and clears the queue', async () => {
    enqueuePending({ upserts: [done('52')], message: 'm' });
    const snapshot = await loadSessions({ fetchFile: async () => ({ sessions: fixtureSessions(), sha: 's' }), putFile: async () => 's2' });
    expect(snapshot).toMatchObject({ pendingCount: 0, problem: null });
    expect(snapshot.sessions.find((s) => s._id === '52')?.status).toBe('done');
    expect(readPending()).toEqual([]);
  });

  it('keeps a change queued while the push was running', async () => {
    enqueuePending({ upserts: [done('52')], message: 'first' });
    await loadSessions({
      fetchFile: async () => ({ sessions: fixtureSessions(), sha: 's' }),
      putFile: async () => {
        enqueuePending({ upserts: [done('53')], message: 'second' });
        return 's2';
      },
    });
    expect(readPending().map((p) => p.message)).toEqual(['second']);
  });

  it('network failure returns cache with pending applied', async () => {
    writeCachedSessions(fixtureSessions());
    enqueuePending({ upserts: [done('52')], message: 'm' });
    const snapshot = await loadSessions(failing(new GitHubError('network', 'offline', null)));
    expect(snapshot.problem?.kind).toBe('network');
    expect(snapshot.pendingCount).toBe(1);
    expect(snapshot.sessions.find((s) => s._id === '52')?.status).toBe('done');
  });

  it('auth failure keeps pending', async () => {
    enqueuePending({ upserts: [done('52')], message: 'm' });
    const snapshot = await loadSessions(failing(new GitHubError('auth', 'Your GitHub token no longer works. Paste a new one in Setup.', 401)));
    expect(snapshot.problem).toEqual({ kind: 'auth', message: 'Your GitHub token no longer works. Paste a new one in Setup.' });
    expect(readPending()).toHaveLength(1);
  });

  it('reports a broken file without writing', async () => {
    enqueuePending({ upserts: [done('52')], message: 'm' });
    const d = failing(new SessionsFileError('sessions.json has a problem: 3.type: bad'));
    const snapshot = await loadSessions(d);
    expect(snapshot.problem?.kind).toBe('invalid_file');
    expect(snapshot.problem?.message).toContain('nothing was overwritten');
    expect(d.putFile).not.toHaveBeenCalled();
  });

  it('first launch offline has no sessions and says so', async () => {
    const snapshot = await loadSessions(failing(new GitHubError('network', 'offline', null)));
    expect(snapshot.sessions).toEqual([]);
    expect(snapshot.problem?.kind).toBe('network');
  });

  it('asks for a token when none is stored', async () => {
    expect((await loadSessions(null)).problem?.kind).toBe('no_token');
  });
});
