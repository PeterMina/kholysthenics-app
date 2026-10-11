import type { Session } from '@/shared/validators';

export interface RemoteFile {
  sessions: Session[];
  sha: string;
}
