import { ActionIcon, Group, NumberInput } from '@mantine/core';
import { useCallback, type ReactElement } from 'react';

type Tone = 'hit' | 'miss' | null;

interface SetStepperProps {
  id: string;
  label: string;
  value: number | null;
  step: number;
  /** Value used when the box is empty and + or − is tapped. */
  start: number;
  tone?: Tone;
  onChange: (value: number | null) => void;
}

const TONE_BORDER: Record<Exclude<Tone, null>, string> = {
  hit: 'var(--mantine-color-green-7)',
  miss: 'var(--mantine-color-red-7)',
};

export const SetStepper = ({ id, label, value, step, start, tone = null, onChange }: SetStepperProps): ReactElement => {
  const handleStep = useCallback(
    (direction: 1 | -1): void => onChange(value === null ? start : Math.max(0, value + direction * step)),
    [onChange, value, start, step],
  );
  const handleDecrease = useCallback((): void => handleStep(-1), [handleStep]);
  const handleIncrease = useCallback((): void => handleStep(1), [handleStep]);
  const handleInput = useCallback((next: number | string): void => onChange(typeof next === 'number' ? next : null), [onChange]);

  return (
    <Group gap={4} wrap="nowrap">
      <ActionIcon id={`${id}-dec`} size={42} variant="default" onClick={handleDecrease} aria-label={`${label} down`}>−</ActionIcon>
      <NumberInput
        id={id}
        aria-label={label}
        value={value ?? ''}
        onChange={handleInput}
        hideControls
        allowNegative={false}
        decimalScale={2}
        inputMode="decimal"
        placeholder="–"
        size="md"
        w="100%"
        styles={{
          input: {
            textAlign: 'center',
            fontFamily: 'var(--mantine-font-family-monospace)',
            borderColor: tone ? TONE_BORDER[tone] : undefined,
          },
        }}
      />
      <ActionIcon id={`${id}-inc`} size={42} variant="default" onClick={handleIncrease} aria-label={`${label} up`}>+</ActionIcon>
    </Group>
  );
};
