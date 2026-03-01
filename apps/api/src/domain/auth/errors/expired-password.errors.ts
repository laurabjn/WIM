export class PasswordResetTokenExpiredError extends Error {
  constructor() {
    super('Password reset token has expired');
    this.name = 'PasswordResetTokenExpiredError';
  }
}
