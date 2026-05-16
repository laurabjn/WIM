export class ForbiddenHomeAccessError extends Error {
  constructor() {
    super('You are not allowed to modify this home');
    this.name = 'ForbiddenHomeAccessError';
  }
}