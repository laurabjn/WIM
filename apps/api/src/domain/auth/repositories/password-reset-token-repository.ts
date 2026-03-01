export interface PasswordResetTokenRepository {
  sign(payload: { userId: string }, expiresInSeconds: number): Promise<string>;
  verify(token: string): Promise<{ userId: string }>;
}
