import { Text } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { dailyLine } from '@/modules/training/utils';

/** One line a day, under the header. Quiet: it should never outshout the session. */
export const DailyLine = (): ReactElement => {
  const line = useMemo(() => dailyLine(), []);
  return (
    <Text
      component="blockquote"
      m={0}
      pl="sm"
      style={{ borderLeft: '2px solid var(--mantine-color-red-6)' }}
    >
      <Text component="span" display="block" fz="sm" fs="italic" lh={1.4}>
        {line.text}
      </Text>
      <Text component="span" display="block" fz={10} ff="monospace" tt="uppercase" c="dimmed" mt={4}>
        {line.source}
      </Text>
    </Text>
  );
};
