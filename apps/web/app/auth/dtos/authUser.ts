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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
}