const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Failed to reset password';
    throw new Error(message);
  }
}