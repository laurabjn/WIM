export type SwipeDirection = 'LIKE' | 'DISLIKE';
 
export interface SwipeEntity {
  id: string;
  swiperId: string;
  targetUserId: string;
  direction: SwipeDirection;
  createdAt: Date;
}