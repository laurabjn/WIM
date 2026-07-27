import { Body, Controller, Get, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { CreateSwipeDto } from 'src/application/swipe/dto/create-swipe.dto';
import { GetSwipeRecommendationsUseCase } from 'src/application/swipe/use-cases/get-swipe-recommendation.usecase';

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    userId?: string;
    id?: string;
  };
};

@Controller('swipes')
@UseGuards(JwtAuthGuard)
export class SwipeController {
  constructor(
    private readonly createSwipeUseCase: CreateSwipeUseCase,
    private readonly getRecommendations: GetSwipeRecommendationsUseCase
  ) { }

  @Post()
  create(@Req() req: any, @Body() dto: CreateSwipeDto) {
    const swiperId = req.user?.sub ?? req.user?.userId ?? req.user?.id;

    if (!swiperId) {
      throw new UnauthorizedException(
        'Utilisateur non authentifié',
      );
    }

    return this.createSwipeUseCase.execute({
      swiperId,
      targetUserId: dto.targetUserId,
      homeId: dto.homeId,
      direction: dto.direction,
    });
  }

  @Get('recommendations')
  async recommendations(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const userId = request.user?.sub ?? request.user?.userId ?? request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'Utilisateur non authentifié',
      );
    }
    const parsedLimit = Number(limit);

    const safeLimit = Number.isFinite(parsedLimit) &&
      parsedLimit > 0
        ? Math.min(parsedLimit, 50)
      : 20;
    
    return this.getRecommendations.execute({
      userId,
      limit: safeLimit,
    });
  }

}