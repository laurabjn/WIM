import { RegisterUserPayload, AuthUser } from "../dtos/authUser";
import { registerUserApi } from "../infrastructure/authApi";

export async function registerUser(payload: RegisterUserPayload): Promise<AuthUser> {
  return registerUserApi(payload);
}