import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { CreateSwipeDto } from 'src/application/swipe/dto/create-swipe.dto';

@Controller('swipes')
export class SwipeController {
  constructor(private readonly createSwipeUseCase: CreateSwipeUseCase) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateSwipeDto) {
    const swiperId = req.user.sub ?? req.user.userId;

    return this.createSwipeUseCase.execute({
      swiperId,
      targetUserId: dto.targetUserId,
      direction: dto.direction,
    });
  }
}