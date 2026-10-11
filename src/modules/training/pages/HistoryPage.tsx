import { Accordion, SegmentedControl, Stack, Text, Title } from '@mantine/core';
import { useCallback, useMemo, type ReactElement } from 'react';
import { JournalEntry } from '@/modules/training/components';
import { useSessions } from '@/modules/training/hooks';
import { archiveSessions, blockSessions } from '@/modules/training/utils';
import { HISTORY_FILTERS, type HistoryFilter } from '@/shared/validators';

interface HistoryPageProps {
  filter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
}

const FILTER_OPTIONS = HISTORY_FILTERS.map((f) => ({ value: f, label: f === 'all' ? 'All' : f }));
const isFilter = (value: string): value is HistoryFilter => (HISTORY_FILTERS as readonly string[]).includes(value);

export const HistoryPage = ({ filter, onFilterChange }: HistoryPageProps): ReactElement => {
  const { sessions } = useSessions();
  const keep = useCallback((type: string): boolean => filter === 'all' || type === filter, [filter]);
  const logged = useMemo(() => blockSessions(sessions).filter((s) => s.status === 'done' && keep(s.type)).reverse(), [sessions, keep]);
  const journal = useMemo(() => archiveSessions(sessions).filter((s) => keep(s.type)), [sessions, keep]);
  const handleFilter = useCallback(
    (value: string): void => {
      if (isFilter(value)) onFilterChange(value);
    },
    [onFilterChange],
  );

  return (
    <Stack gap="md">
      <SegmentedControl id="history-filter" fullWidth size="xs" data={FILTER_OPTIONS} value={filter} onChange={handleFilter} />
      {logged.length > 0 ? (
        <>
          <Title order={3} tt="uppercase">This block</Title>
          <Accordion variant="contained">{logged.map((s) => <JournalEntry key={s._id} session={s} />)}</Accordion>
        </>
      ) : null}
      <Title order={3} tt="uppercase">The journal</Title>
      <Text size="sm" c="dimmed">
        Days 1–49 as written, read-only. Days 1–3 were transcribed from photos of the paper journal; Day 1 has one unreadable word marked [?].
      </Text>
      {journal.length > 0 ? (
        <Accordion variant="contained">{journal.map((s) => <JournalEntry key={s._id} session={s} />)}</Accordion>
      ) : (
        <Text c="dimmed">No {filter} sessions in the journal.</Text>
      )}
    </Stack>
  );
};
