import { LAST_SYNC_KEY } from '@/shared/constants';
import { GitHubError, type GitHubErrorKind } from '@/shared/services';
import { readJson, SessionsFileError, writeJson } from '@/shared/utils';
import { lastSyncSchema, type PendingChange, type Session } from '@/shared/validators';
import { dropPending, mergeUpserts, pushPending, readCachedSessions, readPending, writeCachedSessions, type SyncDeps } from '.';

export type SyncProblemKind = GitHubErrorKind | 'invalid_file' | 'no_token';

export interface SyncProblem {
  kind: SyncProblemKind;
  message: string;
}

export interface SessionsSnapshot {
  sessions: Session[];
  pendingCount: number;
  problem: SyncProblem | null;
  syncedAt: string | null;
}

const NO_TOKEN: SyncProblem = { kind: 'no_token', message: 'Add your GitHub token in Setup.' };

const problemFor = (error: unknown): SyncProblem => {
  if (error instanceof GitHubError) return { kind: error.kind, message: error.message };
  if (error instanceof SessionsFileError) return { kind: 'invalid_file', message: `${error.message} Fix it in the repo; nothing was overwritten.` };
  console.error('Sync failed', error);
  return { kind: 'unknown', message: 'Something went wrong while syncing. Your changes are kept on this phone.' };
};

const applyPending = (sessions: Session[], pending: readonly PendingChange[]): Session[] =>
  pending.reduce((acc, change) => mergeUpserts(acc, change.upserts), sessions);

const offlineSnapshot = (problem: SyncProblem): SessionsSnapshot => {
  const pending = readPending();
  return {
    sessions: applyPending(readCachedSessions() ?? [], pending),
    pendingCount: pending.length,
    problem,
    syncedAt: readJson(LAST_SYNC_KEY, lastSyncSchema),
  };
};

const syncOnce = async (deps: SyncDeps | null): Promise<SessionsSnapshot> => {
  if (!deps) return offlineSnapshot(NO_TOKEN);
  const pending = readPending();
  try {
    const remote = await pushPending(pending, deps);
    dropPending(pending.length);
    writeCachedSessions(remote.sessions);
    const syncedAt = new Date().toISOString();
    writeJson(LAST_SYNC_KEY, syncedAt);
    const stillPending = readPending();
    return { sessions: applyPending(remote.sessions, stillPending), pendingCount: stillPending.length, problem: null, syncedAt };
  } catch (error) {
    return offlineSnapshot(problemFor(error));
  }
};

let lastRun: Promise<SessionsSnapshot> | null = null;

/**
 * Runs one sync at a time. A refetch can start while an earlier one is still
 * in flight; overlapping runs would each drop "their" count of queued changes.
 */
export const loadSessions = (deps: SyncDeps | null): Promise<SessionsSnapshot> => {
  const previous = lastRun;
  const run = (previous ? previous.catch(() => null) : Promise.resolve(null)).then(() => syncOnce(deps));
  lastRun = run;
  return run;
};
