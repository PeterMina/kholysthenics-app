import { Checkbox, Stack } from '@mantine/core';
import { useCallback, type ChangeEvent, type ReactElement } from 'react';
import type { WorkItem } from '@/shared/validators';

interface WorkChecklistProps {
  work: WorkItem[];
  done: Record<string, boolean>;
  onChange: (done: Record<string, boolean>) => void;
}

export const WorkChecklist = ({ work, done, onChange }: WorkChecklistProps): ReactElement => {
  const handleToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const index = event.currentTarget.dataset.index ?? '';
      onChange({ ...done, [index]: event.currentTarget.checked });
    },
    [done, onChange],
  );
  return (
    <Stack gap="sm">
      {work.map((item, index) => (
        <Checkbox
          key={`${item.slot}-${index}`}
          id={`work-${index}`}
          data-index={String(index)}
          checked={done[String(index)] ?? false}
          onChange={handleToggle}
          label={item.text}
          description={item.slot}
          size="md"
        />
      ))}
    </Stack>
  );
};
