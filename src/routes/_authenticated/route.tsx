import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppLayout, LoadingScreen, sessionsQueryOptions } from '@/modules/training';
import { getToken } from '@/shared/services';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: (): void => {
    if (!getToken()) throw redirect({ to: '/setup' });
  },
  loader: async ({ context }): Promise<void> => {
    await context.queryClient.ensureQueryData(sessionsQueryOptions());
  },
  pendingComponent: LoadingScreen,
  component: AppLayout,
});
