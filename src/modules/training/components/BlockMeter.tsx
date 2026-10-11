import { Box, Group, Stack, Text } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { blockSessions, nextSession } from '@/modules/training/utils';
import type { Session } from '@/shared/validators';

interface BlockMeterProps {
  sessions: Session[];
}

export const BlockMeter = ({ sessions }: BlockMeterProps): ReactElement | null => {
  const rows = useMemo(() => blockSessions(sessions), [sessions]);
  const nextId = useMemo(() => nextSession(sessions)?._id, [sessions]);
  if (rows.length === 0) return null;
  const doneCount = rows.filter((s) => s.status === 'done').length;
  return (
    <Stack gap={4} align="flex-end">
      <Group gap={3} align="flex-end" aria-hidden>
        {rows.map((s) => (
          <Box
            key={s._id}
            w={9}
            h={s._id === nextId ? 28 : 22}
            bg={s.status === 'done' ? 'var(--mantine-color-text)' : s._id === nextId ? 'competition' : 'var(--mantine-color-default-border)'}
            style={{ borderRadius: 2 }}
          />
        ))}
      </Group>
      <Text size="xs" ff="monospace" c="dimmed">{doneCount} / {rows.length} logged</Text>
    </Stack>
  );
};
