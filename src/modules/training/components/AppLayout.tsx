import { Container, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, type ReactElement } from 'react';
import { NAV_TABS } from '@/modules/training/constants';
import { useSessions } from '@/modules/training/hooks';
import { blockSessions } from '@/modules/training/utils';
import { BlockMeter, DailyLine, SyncStatus } from '.';

export const AppLayout = (): ReactElement => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (location) => location.pathname });
  const snapshot = useSessions();
  const active = useMemo(() => NAV_TABS.find((tab) => tab.to === pathname)?.to ?? '/', [pathname]);
  const blockLabel = useMemo(() => {
    const days = blockSessions(snapshot.sessions).map((s) => s.day);
    return days.length > 0 ? `Days ${Math.min(...days)}–${Math.max(...days)}` : '';
  }, [snapshot.sessions]);

  const handleTab = useCallback(
    (value: string | null): void => {
      const tab = NAV_TABS.find((t) => t.to === value);
      if (tab) void navigate({ to: tab.to });
    },
    [navigate],
  );

  return (
    <Container size="xs" px="md" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="flex-end" wrap="nowrap">
          <div>
            <Title order={1} fz={34} lh={0.9} tt="uppercase">Kholysthenics</Title>
            <Text size="xs" ff="monospace" c="dimmed" tt="uppercase" mt={6}>{blockLabel}</Text>
          </div>
          <BlockMeter sessions={snapshot.sessions} />
        </Group>
        <Tabs value={active} onChange={handleTab}>
          <Tabs.List grow>
            {NAV_TABS.map((tab) => (
              <Tabs.Tab key={tab.to} value={tab.to} id={tab.id}>{tab.label}</Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
        <DailyLine />
        <SyncStatus snapshot={snapshot} />
        <Outlet />
      </Stack>
    </Container>
  );
};
