import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, type ReactElement } from 'react';
import { HistoryPage } from '@/modules/training';
import type { HistoryFilter } from '@/shared/validators';

const HistoryRoute = (): ReactElement => {
  const { type } = Route.useSearch();
  const navigate = useNavigate({ from: '/history' });
  const handleFilter = useCallback(
    (next: HistoryFilter): void => {
      void navigate({ search: { type: next === 'all' ? undefined : next } });
    },
    [navigate],
  );
  return <HistoryPage filter={type ?? 'all'} onFilterChange={handleFilter} />;
};

export const Route = createLazyFileRoute('/_authenticated/history')({ component: HistoryRoute });
