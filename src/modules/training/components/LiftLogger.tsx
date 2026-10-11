import { Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useCallback, useMemo, type ReactElement } from 'react';
import { DEFAULT_INCREMENT_KG } from '@/modules/training/constants';
import { evaluateLift, type SetEntry } from '@/modules/training/utils';
import { formatKg } from '@/shared/utils';
import type { Lift, LoggedSet } from '@/shared/validators';
import { Plates, SetStepper, VerdictBox } from '.';

const REP_STEP = 1;

interface LiftLoggerProps {
  lift: Lift;
  entries: SetEntry[];
  previous: LoggedSet[] | null;
  onChange: (entries: SetEntry[]) => void;
}

const toneFor = (lift: Lift, reps: number | null): 'hit' | 'miss' | null => {
  if (reps === null) return null;
  if (reps >= lift.repMax) return 'hit';
  return reps < lift.repMin ? 'miss' : null;
};

export const LiftLogger = ({ lift, entries, previous, onChange }: LiftLoggerProps): ReactElement => {
  const verdict = useMemo(() => evaluateLift(lift, entries, previous), [lift, entries, previous]);
  const plan = useMemo(() => {
    const parts = [`${lift.sets} × ${lift.repMin}–${lift.repMax}${lift.perLeg ? ' each leg' : ''}`];
    if (lift.best !== null) parts.push(`best +${formatKg(lift.best)}`);
    if (lift.maxLoad !== undefined) parts.push(`cap ${formatKg(lift.maxLoad)} kg`);
    return parts.join(' · ');
  }, [lift]);

  const update = useCallback(
    (index: number, field: keyof SetEntry, value: number | null): void => {
      onChange(entries.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
    },
    [entries, onChange],
  );

  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="wrap">
        <div>
          <Text fw={600}>{lift.name}</Text>
          <Text size="sm" ff="monospace" c="dimmed">{plan}</Text>
        </div>
        <Plates kg={lift.load} bodyweight={lift.bodyweight} />
      </Group>
      {lift.cue ? <Text size="sm" c="dimmed">{lift.cue}</Text> : null}
      {entries.slice(0, lift.sets).map((entry, index) => (
        <SimpleGrid key={index} cols={lift.bodyweight ? 1 : 2} spacing="xs">
          <SetStepper
            id={`reps-${lift.key}-${index}`}
            label={`Set ${index + 1} reps`}
            value={entry.reps}
            step={REP_STEP}
            start={lift.repMax}
            tone={toneFor(lift, entry.reps)}
            onChange={(value) => update(index, 'reps', value)}
          />
          {lift.bodyweight ? null : (
            <SetStepper
              id={`kg-${lift.key}-${index}`}
              label={`Set ${index + 1} added kg`}
              value={entry.kg}
              step={lift.increment ?? DEFAULT_INCREMENT_KG}
              start={lift.load}
              onChange={(value) => update(index, 'kg', value)}
            />
          )}
        </SimpleGrid>
      ))}
      <VerdictBox id={`verdict-${lift.key}`} verdict={verdict} />
    </Stack>
  );
};
