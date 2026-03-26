import { RegisterUserPayload, RegisterResult } from "../dtos/authUser";
import { registerUserApi } from "../infrastructure/authApi";

export async function registerUser(payload: RegisterUserPayload): Promise<RegisterResult> {
  return registerUserApi(payload);
}