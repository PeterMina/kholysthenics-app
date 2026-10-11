import { Text } from '@mantine/core';
import { createLazyFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

const ComingNext = (): ReactElement => <Text c="dimmed">This view arrives in the next step.</Text>;

export const Route = createLazyFileRoute('/_authenticated/settings')({ component: ComingNext });
