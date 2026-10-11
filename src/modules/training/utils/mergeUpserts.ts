import type { Session } from '@/shared/validators';

/** Pending upserts win over the remote copy for their own _id only. */
export const mergeUpserts = (remote: readonly Session[], upserts: readonly Session[]): Session[] => {
  const byId = new Map<string, Session>();
  for (const upsert of upserts) byId.set(upsert._id, upsert);
  const known = new Set(remote.map((s) => s._id));
  const merged = remote.map((s) => byId.get(s._id) ?? s);
  const added = [...byId.values()].filter((s) => !known.has(s._id));
  return [...merged, ...added];
};
