import { API_URL } from '../../config/api';
import { clearSession } from '../infrastructure/authStorage';

export async function logoutUser(): Promise<void> {

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