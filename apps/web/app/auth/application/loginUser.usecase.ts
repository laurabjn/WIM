import { LoginPayload, LoginResult } from '../dtos/authUser';
import { loginUserApi } from '../infrastructure/authApi';

export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  return loginUserApi(payload);
}