export class AlreadySwipedError extends Error {
  constructor() {
    super('This profile has already been swiped');
    this.name = 'AlreadySwipedError';
  }
}