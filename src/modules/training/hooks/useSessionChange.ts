import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { sessionKeys } from '@/modules/training/constants';
import { enqueuePending, mergeUpserts, type SessionChange, type SessionsSnapshot } from '@/modules/training/utils';

/** Queues a change, shows it at once, then lets the sessions query sync it. */
export const useSessionChange = (): UseMutationResult<void, Error, SessionChange> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (change: SessionChange): Promise<void> => {
      enqueuePending({ upserts: change.upserts, message: change.message });
      queryClient.setQueryData<SessionsSnapshot>(sessionKeys.file(), (old) =>
        old ? { ...old, sessions: mergeUpserts(old.sessions, change.upserts), pendingCount: old.pendingCount + 1 } : old,
      );
      await queryClient.invalidateQueries({ queryKey: sessionKeys.file() });
    },
  });
};
