import { Paper, Stack, Text, Title } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { useSessions } from '@/modules/training/hooks';
import { nextSession, schedule } from '@/modules/training/utils';
import { formatShortDate, todayIso } from '@/shared/utils';

export const TodayPage = (): ReactElement => {
  const { sessions } = useSessions();
  const session = useMemo(() => nextSession(sessions), [sessions]);
  const due = useMemo(() => (session ? schedule(sessions, todayIso())[session._id] : null), [sessions, session]);
  if (!session) {
    return <Text c="dimmed">No session to show yet.</Text>;
  }
  return (
    <Paper withBorder p="md">
      <Stack gap={4}>
        <Title order={2} fz={48} lh={0.85}>Day {session.day}</Title>
        <Text fw={700} c="competition" tt="uppercase">{session.type}</Text>
        {due ? <Text size="sm" ff="monospace" c="dimmed">Due {formatShortDate(due)}</Text> : null}
      </Stack>
    </Paper>
  );
};
