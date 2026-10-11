import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { SESSIONS_STALE_MS, SYNC_RETRY_INTERVAL_MS, sessionKeys } from '@/modules/training/constants';
import { createGitHubDeps, loadSessions, type SessionsSnapshot } from '@/modules/training/utils';
import { getToken } from '@/shared/services';

const IMMEDIATELY_STALE = 0;

/** Changes still waiting, or the last sync failed: try again whenever there is a chance. */
const needsSync = (data: SessionsSnapshot | undefined): boolean =>
  data !== undefined && (data.problem !== null || data.pendingCount > 0);

// Return type inferred on purpose: queryOptions' generic carries the query key type.
export const sessionsQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.file(),
    queryFn: (): Promise<SessionsSnapshot> => {
      const token = getToken();
      return loadSessions(token ? createGitHubDeps(token) : null);
    },
    // An offline fallback is still a successful fetch; without this it would count as
    // fresh and coming back online or reopening the app would not sync.
    staleTime: (query) => (needsSync(query.state.data) ? IMMEDIATELY_STALE : SESSIONS_STALE_MS),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (query) => (needsSync(query.state.data) ? SYNC_RETRY_INTERVAL_MS : false),
  });

export const useSessions = (): SessionsSnapshot => useSuspenseQuery(sessionsQueryOptions()).data;
