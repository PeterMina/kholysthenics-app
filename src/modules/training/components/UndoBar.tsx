import { Button, Group, Text } from '@mantine/core';
import { useTimeout } from '@mantine/hooks';
import { useCallback, useState, type ReactElement } from 'react';
import { CONFIRM_WINDOW_MS } from '@/modules/training/constants';
import { formatShortDate } from '@/shared/utils';
import type { Session } from '@/shared/validators';

interface UndoBarProps {
  session: Session;
  onUndo: () => void;
}

export const UndoBar = ({ session, onUndo }: UndoBarProps): ReactElement => {
  const [armed, setArmed] = useState(false);
  const { start, clear } = useTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
  const handleClick = useCallback((): void => {
    if (!armed) {
      setArmed(true);
      start();
      return;
    }
    clear();
    setArmed(false);
    onUndo();
  }, [armed, start, clear, onUndo]);

  return (
    <Group justify="space-between" wrap="wrap">
      <Text size="sm" c="dimmed">
        Day {session.day} logged {session.loggedAt ? formatShortDate(session.loggedAt) : ''}. Logged it wrong?
      </Text>
      <Button id="undo-log" variant="default" color={armed ? 'red' : undefined} onClick={handleClick}>
        {armed ? 'Tap again to undo' : `Undo Day ${session.day}`}
      </Button>
    </Group>
  );
};
