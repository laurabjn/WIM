export class UserBlockedError extends Error {
  constructor() {
    super('Action not allowed: user is blocked');
    this.name = 'UserBlockedError';
  }
}