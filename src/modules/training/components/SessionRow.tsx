import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { liftSummary } from '@/modules/training/utils';
import { formatShortDate } from '@/shared/utils';
import type { Session } from '@/shared/validators';

interface SessionRowProps {
  session: Session;
  date: string | null;
  isNext: boolean;
}

export const SessionRow = ({ session, date, isNext }: SessionRowProps): ReactElement => {
  const lines = useMemo(() => liftSummary(session), [session]);
  const done = session.status === 'done';
  return (
    <Paper p="sm" withBorder bg={isNext ? 'var(--mantine-color-competition-light)' : undefined}>
      <Group wrap="nowrap" gap="md" align="center">
        <Text ff="heading" fw={800} fz={26} w={44} c={done ? 'dimmed' : isNext ? 'competition' : undefined}>{session.day}</Text>
        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs">
            <Text fw={600}>{session.type}</Text>
            {done ? <Badge size="xs" color="green" variant="light">Logged</Badge> : null}
            {isNext ? <Badge size="xs" variant="light">Next</Badge> : null}
          </Group>
          {lines.map((line) => <Text key={line} size="sm" c="dimmed">{line}</Text>)}
        </Stack>
        <Stack gap={0} align="flex-end">
          <Text size="xs" ff="monospace" c="dimmed">{done ? 'Logged' : 'Due'}</Text>
          <Text ff="heading" fw={700}>{date ? formatShortDate(date) : '–'}</Text>
          <Text size="xs" ff="monospace" c="dimmed">W{session.week}</Text>
        </Stack>
      </Group>
    </Paper>
  );
};
