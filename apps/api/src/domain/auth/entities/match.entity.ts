export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
 
export interface MatchUserEntity {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}
 
export interface MatchEntity {
  id: string;
  user1Id: string;
  user2Id: string;
  user1?: MatchUserEntity | null;
  user2?: MatchUserEntity | null;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}