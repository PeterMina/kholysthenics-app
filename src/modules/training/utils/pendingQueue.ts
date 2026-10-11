import { PENDING_QUEUE_KEY, SESSIONS_CACHE_KEY } from '@/shared/constants';
import { readJson, writeJson } from '@/shared/utils';
import {
  cachedSessionsSchema, checkKeepingOrder, pendingChangeSchema, storedListSchema, type PendingChange, type Session,
} from '@/shared/validators';

/** Validates each stored change on its own, so one bad entry never empties the whole queue. */
export const readPending = (): PendingChange[] =>
  (readJson(PENDING_QUEUE_KEY, storedListSchema) ?? []).flatMap((entry) => {
    const checked = checkKeepingOrder(pendingChangeSchema, entry);
    return checked.ok ? [checked.value] : [];
  });

export const enqueuePending = (change: PendingChange): void => {
  writeJson(PENDING_QUEUE_KEY, [...readPending(), change]);
};

/** Removes the oldest `count` changes — the ones just pushed — keeping anything queued since. */
export const dropPending = (count: number): void => {
  writeJson(PENDING_QUEUE_KEY, readPending().slice(count));
};

export const readCachedSessions = (): Session[] | null => readJson(SESSIONS_CACHE_KEY, cachedSessionsSchema);

export const writeCachedSessions = (sessions: Session[]): void => {
  writeJson(SESSIONS_CACHE_KEY, sessions);
};
