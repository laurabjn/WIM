import { resetPasswordApi } from '../infrastructure/authApi';

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<void> {
  return resetPasswordApi(input);
}