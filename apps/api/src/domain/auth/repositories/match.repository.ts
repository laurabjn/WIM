export type MatchStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'BLOCKED';

export type MatchUserRecord = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  country: string | null;
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

export type MatchWithUsersRecord = {
  id: string;
  user1Id: string;
  user2Id: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;

  user1: MatchUserRecord;
  user2: MatchUserRecord;
};

export interface MatchRepository {
  findByUserId(
    userId: string,
  ): Promise<MatchWithUsersRecord[]>;
}