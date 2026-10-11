import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useTimeout } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { CONFIRM_WINDOW_MS, sessionKeys } from '@/modules/training/constants';
import { useSessions } from '@/modules/training/hooks';
import { syncStatusText } from '@/modules/training/utils';
import { DATA_BRANCH, DATA_FILE_PATH, DATA_REPO_NAME, DATA_REPO_OWNER } from '@/shared/constants';
import { clearToken } from '@/shared/services';

const DATE_LOCALE = 'en-GB';

export const SettingsPage = (): ReactElement => {
  const snapshot = useSessions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [armed, setArmed] = useState(false);
  const { start, clear } = useTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
  const status = useMemo(() => syncStatusText(snapshot), [snapshot]);
  const lastSync = useMemo(
    () => (snapshot.syncedAt ? new Date(snapshot.syncedAt).toLocaleString(DATE_LOCALE) : 'Not yet'),
    [snapshot.syncedAt],
  );

  const handleSync = useCallback((): void => {
    void queryClient.invalidateQueries({ queryKey: sessionKeys.file() });
  }, [queryClient]);

  const handleReplace = useCallback((): void => {
    if (!armed) {
      setArmed(true);
      start();
      return;
    }
    clear();
    clearToken();
    queryClient.removeQueries({ queryKey: sessionKeys.all });
    void navigate({ to: '/setup' });
  }, [armed, start, clear, queryClient, navigate]);

  return (
    <Stack gap="md">
      <Paper withBorder p="md">
        <Stack gap={4}>
          <Text fw={600}>Sync</Text>
          <Text size="sm">{status.text}</Text>
          <Text size="sm" c="dimmed">Last synced: {lastSync}</Text>
          <Text size="sm" c="dimmed" ff="monospace">{DATA_REPO_OWNER}/{DATA_REPO_NAME} · {DATA_BRANCH} · {DATA_FILE_PATH}</Text>
        </Stack>
      </Paper>
      <Group grow>
        <Button id="settings-sync" variant="default" onClick={handleSync}>Sync now</Button>
        <Button id="settings-replace-token" variant="default" color={armed ? 'red' : undefined} onClick={handleReplace}>
          {armed ? 'Tap again to remove' : 'Replace token'}
        </Button>
      </Group>
      <Text size="sm" c="dimmed">Replacing the token keeps any changes still waiting to sync on this phone.</Text>
    </Stack>
  );
};
