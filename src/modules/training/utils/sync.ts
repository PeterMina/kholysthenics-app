import { SYNC_MAX_ATTEMPTS } from '@/modules/training/constants';
import { fetchSessionsFile, GitHubError, putSessionsFile, type RemoteFile } from '@/shared/services';
import { formatSessionsFile } from '@/shared/utils';
import type { PendingChange } from '@/shared/validators';
import { mergeUpserts } from '.';

export interface SyncDeps {
  fetchFile: () => Promise<RemoteFile>;
  putFile: (text: string, sha: string, message: string) => Promise<string>;
}

export const createGitHubDeps = (token: string): SyncDeps => ({
  fetchFile: () => fetchSessionsFile(token),
  putFile: (text, sha, message) => putSessionsFile(token, text, sha, message),
});

export const commitMessageFor = (pending: readonly PendingChange[]): string =>
  pending.length === 1
    ? pending[0].message
    : `chore(log): sync ${pending.length} changes\n\n${pending.map((p) => p.message).join('\n')}`;

export const pushPending = async (
  pending: readonly PendingChange[],
  deps: SyncDeps,
  maxAttempts: number = SYNC_MAX_ATTEMPTS,
): Promise<RemoteFile> => {
  let lastConflict: GitHubError | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const remote = await deps.fetchFile();
    if (pending.length === 0) return remote;
    const merged = pending.reduce((sessions, change) => mergeUpserts(sessions, change.upserts), remote.sessions);
    try {
      const sha = await deps.putFile(formatSessionsFile(merged), remote.sha, commitMessageFor(pending));
      return { sessions: merged, sha };
    } catch (error) {
      if (!(error instanceof GitHubError) || error.kind !== 'conflict') throw error;
      lastConflict = error;
    }
  }
  throw lastConflict ?? new GitHubError('conflict', 'The log kept changing on GitHub. Try again.', null);
};
