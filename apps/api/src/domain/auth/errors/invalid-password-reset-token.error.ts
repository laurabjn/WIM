export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Invalid password reset token');
    this.name = 'InvalidPasswordResetTokenError';
  }
}
