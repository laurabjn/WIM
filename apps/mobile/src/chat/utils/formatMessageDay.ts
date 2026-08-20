type Translate = (key: string) => string;

export function isSameDay(first: string, second: string): boolean {
  const a = new Date(first);
  const b = new Date(second);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatMessageDay(isoDate: string, t: Translate): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) return t('dateToday');
  if (date >= yesterday) return t('dateYesterday');

  const withinYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: withinYear ? undefined : 'numeric',
  });
}

export function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
