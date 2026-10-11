import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getToken } from '@/shared/services';

export const Route = createFileRoute('/_unauthenticated')({
  beforeLoad: (): void => {
    if (getToken()) throw redirect({ to: '/' });
  },
  component: Outlet,
});
