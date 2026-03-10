import { LoginResult, LoginUser } from '../dtos/loginUser';
import { loginUserApi } from '../infrastructure/api';

export async function loginUser(payload: LoginUser): Promise<LoginResult> {
  return loginUserApi(payload);
}