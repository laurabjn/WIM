export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  country: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
}
