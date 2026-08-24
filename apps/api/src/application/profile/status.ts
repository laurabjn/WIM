export const STATUS_TTL_MS = 24 * 60 * 60 * 1000;

export function currentStatus(
  text: string | null | undefined,
  updatedAt: Date | string | null | undefined,
): string | null {
  if (!text || !updatedAt) return null;

  const pose = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  if (Number.isNaN(pose.getTime())) return null;

  return Date.now() - pose.getTime() > STATUS_TTL_MS ? null : text;
}
