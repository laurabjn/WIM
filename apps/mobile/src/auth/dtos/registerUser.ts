export interface RegisterUser {
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
  isAdmin?: boolean;
}

export interface RegisterUserResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    nationality?: string;
    country?: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
    isAdmin?: boolean;
  };
  identityRedirectUrl?: string;
}