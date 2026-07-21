import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { CreateSwipeDto } from 'src/application/swipe/dto/create-swipe.dto';
import { GetSwipeRecommendationsUseCase } from 'src/application/swipe/use-cases/get-swipe-recommendation.usecase';

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@Controller('swipes')
export class SwipeController {
  constructor(
    private readonly createSwipeUseCase: CreateSwipeUseCase,
    private readonly getRecommendations: GetSwipeRecommendationsUseCase
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateSwipeDto) {
    const swiperId = req.user.sub ?? req.user.userId;

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
    const parsedLimit = Number(limit);

    return this.getRecommendations.execute({
      userId: request.user.sub,

      limit:
        Number.isFinite(parsedLimit)
          ? Math.min(
              Math.max(parsedLimit, 1),
              50,
            )
          : 20,
    });
  }

}