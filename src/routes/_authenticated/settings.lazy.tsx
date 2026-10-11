import { createLazyFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/modules/training';

export const Route = createLazyFileRoute('/_authenticated/settings')({ component: SettingsPage });
