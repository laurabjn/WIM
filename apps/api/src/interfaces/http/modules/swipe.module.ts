import { Module } from '@nestjs/common';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SwipePrismaRepository } from 'src/infrastructure/repositories/swipe.prisma.repository';
import { SwipeController } from '../controllers/swipe.controller';
import { SWIPE_REPOSITORY } from '../tokens/token';

@Module({
  controllers: [SwipeController],
  providers: [
    PrismaService,
    {
      provide: SWIPE_REPOSITORY,
      useClass: SwipePrismaRepository,
    },
    {
      provide: CreateSwipeUseCase,
      useFactory: (swipeRepository) => {
        return new CreateSwipeUseCase(swipeRepository);
      },
      inject: [SWIPE_REPOSITORY],
    },
  ],
  exports: [CreateSwipeUseCase],
})
export class SwipeModule {}