import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { ReactElement } from 'react';

export interface RouterContext {
  queryClient: QueryClient;
}

const RootComponent = (): ReactElement => <Outlet />;

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootComponent });
