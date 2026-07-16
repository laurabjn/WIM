export type SwipeDirection = 'LIKE' | 'DISLIKE';

export type CreateSwipeInput = {
  swiperId: string;
  targetUserId: string;
  direction: SwipeDirection;
};

export interface SwipeRepository {
  create(input: CreateSwipeInput): Promise<void>;
  hasLike(fromUserId: string, toUserId: string): Promise<boolean>;
  createMatch(userAId: string, userBId: string): Promise<{ id: string }>;
}