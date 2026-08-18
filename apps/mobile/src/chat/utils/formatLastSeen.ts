import type { TFunction } from 'i18next';

/**
 * Rend la derniere presence sous forme lisible. Au-dela d'une semaine, la
 * precision n'apprend plus rien : on s'arrete a la date.
 */
export function formatLastSeen(iso: string, t: TFunction): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '';

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return t('lastSeenNow');
  if (minutes < 60) return t('lastSeenMinutes', { count: minutes });

  const heures = Math.floor(minutes / 60);

  if (heures < 24) return t('lastSeenHours', { count: heures });

  const jours = Math.floor(heures / 24);

  if (jours <= 7) return t('lastSeenDays', { count: jours });

  return t('lastSeenOn', {
    date: date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    }),
  });
}
