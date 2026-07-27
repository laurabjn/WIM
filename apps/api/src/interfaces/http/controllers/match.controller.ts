import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard,} from '../jwt-auth.guard';
import {GetMyMatchesUseCase,} from 'src/application/swipe/use-cases/get-my-matches.usecase';

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    userId?: string;
    id?: string;
  };
};

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(
    private readonly getMyMatchesUseCase:
      GetMyMatchesUseCase,
  ) {}

  @Get('me')
  getMyMatches(
    @Req()
    request: AuthenticatedRequest,
  ) {
    const userId =
      request.user?.sub ??
      request.user?.userId ??
      request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'Utilisateur non authentifié',
      );
    }

    return this.getMyMatchesUseCase.execute(
      userId,
    );
  }
}