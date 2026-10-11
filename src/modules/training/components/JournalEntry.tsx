import { Accordion, Badge, Code, Group, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { formatShortDate } from '@/shared/utils';
import type { Session } from '@/shared/validators';

const DONE_MARK = /\s*✅\s*$/;

const notesFromLog = (session: Session): string => {
  const skill = session.skill ? [`Skill: ${session.skill.name} · ${session.skill.target}`] : [];
  const work = session.work.map((w, i) => `${session.log.done?.[String(i)] ? '✓' : '–'} ${w.slot}: ${w.text}`);
  return [...skill, ...work, session.log.notes ?? ''].filter(Boolean).join('\n');
};

interface JournalEntryProps {
  session: Session;
}

export const JournalEntry = ({ session }: JournalEntryProps): ReactElement => (
  <Accordion.Item value={session._id}>
    <Accordion.Control id={`journal-${session._id}`}>
      <Group wrap="nowrap" gap="md">
        <Text ff="heading" fw={800} fz={24} w={40}>{session.day}</Text>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs">
            <Text fw={600}>{session.type}</Text>
            {session.handwritten ? <Badge size="xs" variant="outline">Photo</Badge> : null}
          </Group>
          <Text size="sm" c="dimmed" truncate>{(session.title ?? '').replace(DONE_MARK, '')}</Text>
        </div>
        <Text size="xs" ff="monospace" c="dimmed">{session.loggedAt ? formatShortDate(session.loggedAt) : ''}</Text>
      </Group>
    </Accordion.Control>
    <Accordion.Panel>
      <Code block style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {session.notesText ?? notesFromLog(session)}
      </Code>
    </Accordion.Panel>
  </Accordion.Item>
);
