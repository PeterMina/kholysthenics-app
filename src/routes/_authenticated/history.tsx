import { createFileRoute } from '@tanstack/react-router';
import { historySearchSchema } from '@/shared/validators';

export const Route = createFileRoute('/_authenticated/history')({ validateSearch: historySearchSchema });
