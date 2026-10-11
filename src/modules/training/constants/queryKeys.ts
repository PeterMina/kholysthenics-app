export const sessionKeys = {
  all: ['sessions'] as const,
  file: () => [...sessionKeys.all, 'file'] as const,
};
