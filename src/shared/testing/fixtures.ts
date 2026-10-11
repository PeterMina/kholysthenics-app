import { readFileSync } from 'node:fs';
import { parseSessionsFile } from '@/shared/utils';
import type { Session } from '@/shared/validators';

const FIXTURE_URL = new URL('./sessions.fixture.json', import.meta.url);

export const readFixtureText = (): string => readFileSync(FIXTURE_URL, 'utf8');

export const fixtureSessions = (): Session[] => parseSessionsFile(readFixtureText());
