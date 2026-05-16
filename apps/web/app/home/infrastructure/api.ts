export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export const SERVER_URL = API_URL.replace(/\/api$/, '');

export function resolveImageUrl(url?: string | null) {
  if (!url) return '/images/placeholder-home.jpg';
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
}