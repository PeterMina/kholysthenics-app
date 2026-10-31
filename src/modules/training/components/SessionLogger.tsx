import { Button, Divider, Group, Paper, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCallback, useMemo, useState, type ChangeEvent, type ReactElement, type ReactNode } from 'react';
import { useDraft, useSessionChange } from '@/modules/training/hooks';
import { logSession, LogValidationError, previousLoggedSets, skipSession, type SetEntry } from '@/modules/training/utils';
import { formatShortDate, formatWeekday, todayIso } from '@/shared/utils';
import type { Session } from '@/shared/validators';
import { LiftLogger, WorkChecklist } from '.';

interface SessionLoggerProps {
  session: Session;
  sessions: Session[];
  due: string | null;
}

interface SectionProps {
  label: string;
  children: ReactNode;
}

const Section = ({ label, children }: SectionProps): ReactElement => (
  <>
    <Divider />
    <Stack gap="xs" p="md">
      <Text size="xs" ff="monospace" c="dimmed" tt="uppercase">{label}</Text>
      {children}
    </Stack>
  </>
);

export const SessionLogger = ({ session, sessions, due }: SessionLoggerProps): ReactElement => {
  const [draft, setDraft, removeDraft] = useDraft(session);
  const [skipReason, setSkipReason] = useState('');
  const [skipOpen, setSkipOpen] = useState(false);
  const change = useSessionChange();
  const today = todayIso();
  const dueLabel = useMemo(() => (due === null ? '' : due === today ? 'Today' : formatWeekday(due)), [due, today]);

  const handleLift = useCallback(
    (key: string, entries: SetEntry[]): void => setDraft({ ...draft, lifts: { ...draft.lifts, [key]: entries } }),
    [draft, setDraft],
  );
  const handleDone = useCallback((done: Record<string, boolean>): void => setDraft({ ...draft, done }), [draft, setDraft]);
  const handleNotes = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>): void => setDraft({ ...draft, notes: event.currentTarget.value }),
    [draft, setDraft],
  );
  const handleDate = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => setDraft({ ...draft, date: event.currentTarget.value }),
    [draft, setDraft],
  );

  const handleLog = useCallback((): void => {
    try {
      const result = logSession(sessions, session._id, draft, today);
      removeDraft();
      change.mutate(result);
      notifications.show({ color: 'green', message: [`Day ${session.day} logged.`, ...result.notices].join(' ') });
    } catch (error) {
      if (!(error instanceof LogValidationError)) throw error;
      notifications.show({ color: 'red', message: error.message });
    }
  }, [sessions, session, draft, today, removeDraft, change]);

  const handleSkip = useCallback((): void => {
    try {
      const result = skipSession(sessions, session._id, skipReason, today);
      removeDraft();
      setSkipOpen(false);
      setSkipReason('');
      change.mutate(result);
      notifications.show({ color: 'gray', message: [`Day ${session.day} skipped.`, ...result.notices].join(' ') });
    } catch (error) {
      if (!(error instanceof LogValidationError)) throw error;
      notifications.show({ color: 'red', message: error.message });
    }
  }, [sessions, session, skipReason, today, removeDraft, change]);

  return (
    <Paper withBorder radius="lg">
      <Group justify="space-between" align="flex-start" p="md" wrap="nowrap">
        <div>
          <Title order={2} fz={48} lh={0.85}>Day {session.day}</Title>
          <Text fw={800} ff="heading" fz={22} c="competition" tt="uppercase">{session.type}</Text>
        </div>
        {due ? (
          <Stack gap={0} align="flex-end">
            <Text size="xs" ff="monospace" c="dimmed">Due</Text>
            <Text ff="heading" fw={800} fz={18} tt="uppercase" c={due === today ? 'competition' : undefined}>{dueLabel}</Text>
            <Text size="xs" ff="monospace" c="dimmed">{formatShortDate(due)}</Text>
          </Stack>
        ) : null}
      </Group>
      {session.skill ? (
        <Section label="1 · Skill, while fresh">
          <div>
            <Text fw={600}>{session.skill.name}</Text>
            <Text size="sm" ff="monospace" c="dimmed">{session.skill.target}</Text>
          </div>
        </Section>
      ) : null}
      {session.lifts.map((lift) => (
        <Section key={lift.key} label="2 · Top set">
          <LiftLogger
            lift={lift}
            entries={draft.lifts[lift.key] ?? []}
            previous={previousLoggedSets(sessions, lift.key, session.order)}
            onChange={(entries) => handleLift(lift.key, entries)}
          />
        </Section>
      ))}
      {session.work.length > 0 ? (
        <Section label="The rest">
          <WorkChecklist work={session.work} done={draft.done} onChange={handleDone} />
        </Section>
      ) : null}
      <Section label="Log it">
        <TextInput id="log-date" type="date" label="Trained on" value={draft.date} max={today} onChange={handleDate} />
        <Textarea
          id="log-notes"
          label="Notes"
          placeholder="How it felt, what you changed"
          autosize
          minRows={2}
          value={draft.notes}
          onChange={handleNotes}
        />
        <Button id="log-session" size="lg" onClick={handleLog} loading={change.isPending}>Log Day {session.day}</Button>
      </Section>
      <Section label="Can't train it">
        {skipOpen ? (
          <>
            <TextInput
              id="skip-reason"
              label="Why"
              placeholder="Injured, ill, travelling"
              value={skipReason}
              onChange={(event) => setSkipReason(event.currentTarget.value)}
            />
            <Text size="xs" c="dimmed">
              Skipping moves no weight. The next sessions keep the load you have now, to be earned
              when you are back.
            </Text>
            <Group grow>
              <Button variant="default" onClick={() => setSkipOpen(false)}>Cancel</Button>
              <Button id="skip-session" color="gray" onClick={handleSkip} loading={change.isPending}>
                Skip Day {session.day}
              </Button>
            </Group>
          </>
        ) : (
          <Button id="skip-open" variant="subtle" color="gray" onClick={() => setSkipOpen(true)}>
            Skip this one
          </Button>
        )}
      </Section>
    </Paper>
  );
};
