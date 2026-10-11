import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { SESSIONS_STALE_MS, SYNC_RETRY_INTERVAL_MS, sessionKeys } from '@/modules/training/constants';
import { createGitHubDeps, loadSessions, type SessionsSnapshot } from '@/modules/training/utils';
import { getToken } from '@/shared/services';

// Return type inferred on purpose: queryOptions' generic carries the query key type.
export const sessionsQueryOptions = () =>
  queryOptions({
    queryKey: sessionKeys.file(),
    queryFn: (): Promise<SessionsSnapshot> => {
      const token = getToken();
      return loadSessions(token ? createGitHubDeps(token) : null);
    },
    staleTime: SESSIONS_STALE_MS,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && (data.problem || data.pendingCount > 0) ? SYNC_RETRY_INTERVAL_MS : false;
    },
  });

export const useSessions = (): SessionsSnapshot => useSuspenseQuery(sessionsQueryOptions()).data;
