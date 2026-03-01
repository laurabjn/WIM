const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export async function requestPasswordReset(
  email: string,
  locale: 'fr' | 'en',
): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, locale }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Failed to request password reset';
    throw new Error(message);
  }
}