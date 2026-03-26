import { requestPasswordResetApi } from '../infrastructure/authApi';

export async function requestPasswordReset(
  email: string,
  locale: 'fr' | 'en',
): Promise<void> {
  return requestPasswordResetApi(email, locale);
}