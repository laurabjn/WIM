export type SwipeDirection = 'LIKE' | 'DISLIKE';

export type CreateSwipeInput = {
  swiperId: string;
  targetUserId: string;
  homeId: string;
  direction: SwipeDirection;
};

export type SwipeRecord = {
  id: string;
  swiperId: string;
  targetUserId: string;
  homeId: string;
  direction: SwipeDirection;
  createdAt: Date;
};

export type MatchRecord = {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  chat: {
    id: string;
    matchId: string;
    createdAt: Date;
    updatedAt: Date;

    participants: Array<{
      id: string;
      chatId: string;
      userId: string;
      joinedAt: Date;
    }>;
  };
};

export interface SwipeRepository {
  create(input: CreateSwipeInput): Promise<SwipeRecord>;
  hasLike(swiperId: string, targetUserId: string): Promise<boolean>;
  createMatch(firstUserId: string, secondUserId: string): Promise<MatchRecord>;
  homeBelongsToUser(homeId: string, userId: string): Promise<boolean>;
  hasOpenConversation(firstUserId: string, secondUserId: string): Promise<boolean>;
}