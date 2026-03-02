import { clearSession } from '../infrastructure/authStorage';

export async function logoutUser(): Promise<void> {
  const API_URL = (global as any).API_URL || 'http://10.0.2.2:3002/api';

  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    await response.json().catch(() => ({}));
  } catch (e) {
    console.error('Logout failed:', e);
  } finally {
    await clearSession();
  }
}