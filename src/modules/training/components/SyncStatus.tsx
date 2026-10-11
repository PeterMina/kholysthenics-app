import { Group, Text, ThemeIcon } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { SYNC_TONE_COLORS } from '@/modules/training/constants';
import { syncStatusText, type SessionsSnapshot } from '@/modules/training/utils';

interface SyncStatusProps {
  snapshot: SessionsSnapshot;
}

export const SyncStatus = ({ snapshot }: SyncStatusProps): ReactElement => {
  const status = useMemo(() => syncStatusText(snapshot), [snapshot]);
  return (
    <Group gap="xs" wrap="nowrap" role="status" aria-live="polite">
      <ThemeIcon size={10} radius="xl" color={SYNC_TONE_COLORS[status.tone]} />
      <Text size="sm" c="dimmed">{status.text}</Text>
    </Group>
  );
};
