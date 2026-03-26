import { clearSession } from '../infrastructure/authStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function logoutUser(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    await response.json().catch(() => ({}));
  } catch (e) {
    console.error('Logout failed:', e);
  } finally {
    clearSession();
  }
}