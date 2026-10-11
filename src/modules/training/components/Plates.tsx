import { Box, Group, Text } from '@mantine/core';
import { useMemo, type ReactElement } from 'react';
import { PLATE_STYLES, SMALL_PLATE_STYLE } from '@/modules/training/constants';
import { plateStack } from '@/modules/training/utils';
import { formatKg } from '@/shared/utils';

interface PlatesProps {
  kg: number;
  bodyweight?: boolean;
}

export const Plates = ({ kg, bodyweight = false }: PlatesProps): ReactElement => {
  const plates = useMemo(() => plateStack(kg), [kg]);
  if (bodyweight || kg === 0) return <Text ff="heading" fz={26} fw={800}>b.w</Text>;
  return (
    <Group gap={2} align="center" wrap="nowrap" aria-label={`Plus ${formatKg(kg)} kilograms`}>
      <Box w={14} h={6} bg="gray.6" />
      {plates.map((plate, index) => {
        const style = PLATE_STYLES[plate] ?? SMALL_PLATE_STYLE;
        return (
          <Box
            key={`${plate}-${index}`}
            w={style.width}
            h={style.height}
            bg={style.color}
            style={{ borderRadius: 3, border: '1px solid var(--mantine-color-dark-9)' }}
          />
        );
      })}
      <Text ff="heading" fz={26} fw={800} ml={8}>+{formatKg(kg)}</Text>
    </Group>
  );
};
