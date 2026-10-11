import { Center, Loader } from '@mantine/core';
import type { ReactElement } from 'react';

export const LoadingScreen = (): ReactElement => (
  <Center h="60vh">
    <Loader aria-label="Loading your log" />
  </Center>
);
