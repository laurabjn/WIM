export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export const SITE_URL =
  process.env.EXPO_PUBLIC_SITE_URL ?? 'https://worldismine.fr';

export const APP_URL =
  process.env.EXPO_PUBLIC_APP_URL ?? 'https://app.worldismine.fr';

export function lienDuLogement(homeId: string): string {
  return `${APP_URL.replace(/\/$/, '')}/homes/${homeId}`;
}
