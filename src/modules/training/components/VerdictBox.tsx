import { Alert } from '@mantine/core';
import type { ReactElement } from 'react';
import { VERDICT_COLORS } from '@/modules/training/constants';
import type { Verdict } from '@/modules/training/utils';

interface VerdictBoxProps {
  id: string;
  verdict: Verdict;
}

export const VerdictBox = ({ id, verdict }: VerdictBoxProps): ReactElement => (
  <Alert id={id} variant="light" color={VERDICT_COLORS[verdict.state]} title={verdict.label} aria-live="polite">
    {verdict.message}
  </Alert>
);
