import { Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

const Placeholder = (): ReactElement => <Title order={1}>Kholysthenics</Title>;

export const Route = createFileRoute('/')({ component: Placeholder });
