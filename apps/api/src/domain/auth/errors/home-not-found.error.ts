export class HomeNotFoundError extends Error {
  constructor() {
    super('Home not found');
    this.name = 'HomeNotFoundError';
  }
}