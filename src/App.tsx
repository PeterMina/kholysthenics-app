import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { routeTree } from '@/routeTree.gen';
import { theme } from '@/shared/styles';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export const queryClient = new QueryClient({
  defaultOptions: {
    // The query function handles offline itself (it falls back to the phone's copy).
    queries: { networkMode: 'always' },
    mutations: { networkMode: 'always' },
  },
});

export const router = createRouter({ routeTree, context: { queryClient }, basepath: BASE_PATH });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App = (): ReactElement => (
  <MantineProvider theme={theme} defaultColorScheme="auto">
    <Notifications position="top-center" />
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MantineProvider>
);
