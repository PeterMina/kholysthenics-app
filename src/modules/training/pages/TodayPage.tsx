import { Paper, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCallback, useMemo, type ReactElement } from 'react';
import { SessionLogger, UndoBar } from '@/modules/training/components';
import { useSessionChange, useSessions } from '@/modules/training/hooks';
import { draftKey, lastUndoable, nextSession, schedule, undoLastLog } from '@/modules/training/utils';
import { todayIso, writeJson } from '@/shared/utils';

export const TodayPage = (): ReactElement => {
  const { sessions, problem } = useSessions();
  const change = useSessionChange();
  const session = useMemo(() => nextSession(sessions), [sessions]);
  const undoable = useMemo(() => lastUndoable(sessions), [sessions]);
  const due = useMemo(() => (session ? schedule(sessions, todayIso())[session._id] ?? null : null), [sessions, session]);

  const handleUndo = useCallback((): void => {
    const result = undoLastLog(sessions, todayIso());
    if (!result) return;
    writeJson(draftKey(result.sessionId), result.draft);
    change.mutate(result);
    notifications.show({ message: `Day ${undoable?.day ?? ''} reopened with what you entered. Load changes reverted.` });
  }, [sessions, change, undoable]);

  if (sessions.length === 0) {
    return (
      <Paper withBorder p="lg">
        <Title order={3} tt="uppercase">No log on this phone yet</Title>
        <Text c="dimmed">{problem?.message ?? 'Connect to the internet once to download your log.'}</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {session ? (
        <SessionLogger key={session._id} session={session} sessions={sessions} due={due} />
      ) : (
        <Paper withBorder p="lg">
          <Title order={3} tt="uppercase">Block complete</Title>
          <Text c="dimmed">Every session in this block is logged. Ask Claude to plan the next block from what you hit.</Text>
        </Paper>
      )}
      {undoable ? <UndoBar session={undoable} onUndo={handleUndo} /> : null}
    </Stack>
  );
};
