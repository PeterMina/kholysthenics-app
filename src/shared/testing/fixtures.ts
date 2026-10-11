import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSessionsFile } from '@/shared/utils';
import type { Session } from '@/shared/validators';

// Built from the import.meta.url string, not `new URL`, so it also works under jsdom's URL.
const FIXTURE_PATH = join(dirname(fileURLToPath(import.meta.url)), 'sessions.fixture.json');

export const readFixtureText = (): string => readFileSync(FIXTURE_PATH, 'utf8');

export const fixtureSessions = (): Session[] => parseSessionsFile(readFixtureText());
