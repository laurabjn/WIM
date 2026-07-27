import { Inject, Injectable } from '@nestjs/common';
import {
  MatchRepository,
  MatchUserRecord,
} from 'src/domain/auth/repositories/match.repository';
import { MATCH_REPOSITORY } from 'src/interfaces/http/tokens/token';

export type MyMatchResult = {
  id: string;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'BLOCKED';

  createdAt: Date;

  user: MatchUserRecord;
};

@Injectable()
export class GetMyMatchesUseCase {
  constructor(
    @Inject(MATCH_REPOSITORY)
    private readonly matchRepository:
      MatchRepository,
  ) {}

  async execute(
    userId: string,
  ): Promise<MyMatchResult[]> {
    const matches =
      await this.matchRepository.findByUserId(
        userId,
      );

    return matches.map(match => {
      const otherUser =
        match.user1Id === userId
          ? match.user2
          : match.user1;

      return {
        id: match.id,
        status: match.status,
        createdAt: match.createdAt,
        user: otherUser,
      };
    });
  }
}