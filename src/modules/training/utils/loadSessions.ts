import { z } from 'zod';
import { LAST_SYNC_KEY } from '@/shared/constants';
import { GitHubError, type GitHubErrorKind } from '@/shared/services';
import { readJson, SessionsFileError, writeJson } from '@/shared/utils';
import type { PendingChange, Session } from '@/shared/validators';
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
const lastSyncSchema = z.string();

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

export const loadSessions = async (deps: SyncDeps | null): Promise<SessionsSnapshot> => {
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
