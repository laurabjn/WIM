import { Module } from '@nestjs/common';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SwipePrismaRepository } from 'src/infrastructure/repositories/swipe.prisma.repository';
import { SwipeController } from '../controllers/swipe.controller';
import { SWIPE_REPOSITORY } from '../tokens/token';
import { GetSwipeRecommendationsUseCase } from 'src/application/swipe/use-cases/get-swipe-recommendation.usecase';
import { HomeRecommendationScorer } from 'src/application/swipe/services/home-recommendation-scorer';
import { UserRecommendationProfileBuilder } from 'src/application/swipe/services/user-recommendation-profile.builder';
import { SwipeRecommendationPrismaRepository } from 'src/infrastructure/repositories/swipe-recommendation.prisma.repository';

@Module({
  controllers: [SwipeController],
  providers: [
    PrismaService,
    SwipeRecommendationPrismaRepository,
    UserRecommendationProfileBuilder,
    HomeRecommendationScorer,
    GetSwipeRecommendationsUseCase,
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
  exports: [CreateSwipeUseCase, GetSwipeRecommendationsUseCase],
})
export class SwipeModule {}