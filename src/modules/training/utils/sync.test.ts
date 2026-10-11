import { describe, expect, it, vi } from 'vitest';
import { commitMessageFor, pushPending, type SyncDeps } from '@/modules/training';
import { GitHubError } from '@/shared/services';
import { parseSessionsFile } from '@/shared/utils';
import { fixtureSessions } from '@/shared/testing';
import type { Session } from '@/shared/validators';

const done = (id: string): Session => {
  const base = fixtureSessions().find((s) => s._id === id);
  if (!base) throw new Error(`no fixture ${id}`);
  return { ...base, status: 'done', loggedAt: '2026-10-12' };
};

const deps = (remotes: Session[][], putResults: (string | GitHubError)[]): SyncDeps & { puts: string[] } => {
  const puts: string[] = [];
  let fetches = 0;
  let putCount = 0;
  return {
    puts,
    fetchFile: vi.fn(async () => {
      fetches += 1;
      return { sessions: remotes[Math.min(fetches - 1, remotes.length - 1)], sha: `sha-${fetches}` };
    }),
    putFile: vi.fn(async (text: string) => {
      puts.push(text);
      const result = putResults[putCount];
      putCount += 1;
      if (result instanceof GitHubError) throw result;
      return result;
    }),
  };
};
const conflict = (): GitHubError => new GitHubError('conflict', 'changed', 409);

describe('pushPending', () => {
  it('only fetches when nothing is pending', async () => {
    const d = deps([fixtureSessions()], []);
    const file = await pushPending([], d);
    expect(file.sessions).toHaveLength(63);
    expect(d.putFile).not.toHaveBeenCalled();
  });

  it('writes the merged file with the change message', async () => {
    const d = deps([fixtureSessions()], ['new-sha']);
    const file = await pushPending([{ upserts: [done('52')], message: 'chore(log): day 52 legs' }], d);
    expect(file.sha).toBe('new-sha');
    expect(d.putFile).toHaveBeenCalledWith(expect.any(String), 'sha-1', 'chore(log): day 52 legs');
    expect(parseSessionsFile(d.puts[0]).find((s) => s._id === '52')?.status).toBe('done');
  });

  it('conflict retries on the fresh copy and keeps the other edit', async () => {
    const edited = fixtureSessions().map((s) => (s._id === '53' ? { ...s, week: 9 } : s));
    const d = deps([fixtureSessions(), edited], [conflict(), 'sha-ok']);
    await pushPending([{ upserts: [done('52')], message: 'm' }], d);
    expect(d.fetchFile).toHaveBeenCalledTimes(2);
    const written = parseSessionsFile(d.puts[1]);
    expect(written.find((s) => s._id === '53')?.week).toBe(9);
    expect(written.find((s) => s._id === '52')?.status).toBe('done');
  });

  it('gives up after three conflicts', async () => {
    const d = deps([fixtureSessions()], [conflict(), conflict(), conflict()]);
    await expect(pushPending([{ upserts: [done('52')], message: 'm' }], d)).rejects.toMatchObject({ kind: 'conflict' });
  });

  it('combines several changes into one commit message', () => {
    expect(commitMessageFor([{ upserts: [], message: 'a' }, { upserts: [], message: 'b' }])).toBe('chore(log): sync 2 changes\n\na\nb');
  });
});
