import { createLazyFileRoute } from '@tanstack/react-router';
import { SetupPage } from '@/modules/setup';

export const Route = createLazyFileRoute('/_unauthenticated/setup')({ component: SetupPage });
