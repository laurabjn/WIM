export class InvalidSwipeTargetError extends Error {
  constructor() {
    super('A user cannot swipe on themselves');
    this.name = 'InvalidSwipeTargetError';
  }
}