import { createLazyFileRoute } from '@tanstack/react-router';
import { TodayPage } from '@/modules/training';

export const Route = createLazyFileRoute('/_authenticated/')({ component: TodayPage });
