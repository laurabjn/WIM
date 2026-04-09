export interface LoginUser {
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