export interface RegisterUserPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}
