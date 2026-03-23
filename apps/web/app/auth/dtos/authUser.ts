export interface RegisterUserPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  nationality?: string;
  country?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export type RegisterFormData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  country: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bio: string;
  avatarFile: File | null;
};

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

export interface RegisterResult {
  user: AuthUser;
  identityRedirectUrl?: string;
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