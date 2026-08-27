import { Module } from '@nestjs/common';
import { CreateSwipeUseCase } from 'src/application/swipe/use-cases/create-swipe.usecase';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { SwipePrismaRepository } from 'src/infrastructure/repositories/swipe.prisma.repository';
import { SwipeController } from '../controllers/swipe.controller';
import { MATCH_REPOSITORY, SWIPE_REPOSITORY } from '../tokens/token';
import { GetSwipeRecommendationsUseCase } from 'src/application/swipe/use-cases/get-swipe-recommendation.usecase';
import { HomeRecommendationScorer } from 'src/application/swipe/services/home-recommendation-scorer';
import { RecommendationWeightsService } from 'src/application/swipe/services/recommendation-weights.service';
import { UserRecommendationProfileBuilder } from 'src/application/swipe/services/user-recommendation-profile.builder';
import { SwipeRecommendationPrismaRepository } from 'src/infrastructure/repositories/swipe-recommendation.prisma.repository';
import { MatchController } from '../controllers/match.controller';
import { GetMyMatchesUseCase } from 'src/application/swipe/use-cases/get-my-matches.usecase';
import { MatchPrismaRepository } from 'src/infrastructure/repositories/match.prisma.repository';

@Module({
  controllers: [SwipeController, MatchController],
  providers: [
    PrismaService,
    PushSenderService,
    SwipeRecommendationPrismaRepository,
    UserRecommendationProfileBuilder,
    HomeRecommendationScorer,
    RecommendationWeightsService,
    GetSwipeRecommendationsUseCase,
    GetMyMatchesUseCase,
    {
      provide: MATCH_REPOSITORY,
      useClass: MatchPrismaRepository,
    },
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