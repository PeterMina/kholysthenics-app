import { Stack, Text } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { SessionRow } from '@/modules/training/components';
import { useSessions } from '@/modules/training/hooks';
import { blockSessions, nextSession, schedule } from '@/modules/training/utils';
import { todayIso } from '@/shared/utils';

export const BlockPage = (): ReactElement => {
  const { sessions } = useSessions();
  const rows = useMemo(() => blockSessions(sessions), [sessions]);
  const due = useMemo(() => schedule(sessions, todayIso()), [sessions]);
  const nextId = useMemo(() => nextSession(sessions)?._id, [sessions]);
  return (
    <Stack gap="xs">
      <Text size="sm" c="dimmed">
        Dates roll forward from the last session you logged on a 2 / 2 / 3 day rhythm. Miss one and nothing is owed: the next session moves to today.
      </Text>
      {rows.map((s) => (
        <SessionRow key={s._id} session={s} date={s.status === 'done' ? s.loggedAt : due[s._id] ?? null} isNext={s._id === nextId} />
      ))}
    </Stack>
  );
};
