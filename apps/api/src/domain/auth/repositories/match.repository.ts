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
};

export type MatchChatRecord = {
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

export type MatchWithUsersRecord = {
  id: string;
  user1Id: string;
  user2Id: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;

  user1: MatchUserRecord;
  user2: MatchUserRecord;

  // Le chat est une relation de Match, pas de User : un match n'a qu'une seule
  // conversation, partagée par les deux participants. Nullable tant qu'aucune
  // conversation n'a été ouverte pour ce match.
  chat: MatchChatRecord | null;
};

export interface MatchRepository {
  findByUserId(
    userId: string,
  ): Promise<MatchWithUsersRecord[]>;
}