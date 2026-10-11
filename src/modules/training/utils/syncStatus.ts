import type { SessionsSnapshot } from '.';

export interface SyncStatusLine {
  tone: 'ok' | 'waiting' | 'problem';
  text: string;
}

export const syncStatusText = (snapshot: SessionsSnapshot): SyncStatusLine => {
  const { pendingCount, problem } = snapshot;
  if (pendingCount > 0 && (!problem || problem.kind === 'network' || problem.kind === 'rate_limited')) {
    const noun = pendingCount === 1 ? 'change' : 'changes';
    const verb = pendingCount === 1 ? 'It' : 'They';
    return { tone: 'waiting', text: `${pendingCount} ${noun} saved on this phone. ${verb} will sync when you're online.` };
  }
  if (problem) return { tone: 'problem', text: problem.message };
  return { tone: 'ok', text: 'Synced with GitHub.' };
};
