import { Module } from '@nestjs/common';
import { ModerationModule } from './moderation.module';

import { HomeRatingService } from 'src/application/home/services/home-rating.service';
import {
  DeleteReviewUseCase,
  ReplyToReviewUseCase,
  ReportReviewUseCase,
  UpdateReviewUseCase,
} from 'src/application/home/use-cases/manage-reviews.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ReviewController } from '../controllers/review.controller';

@Module({
  controllers: [ReviewController],
  imports: [ModerationModule],
  providers: [
    PrismaService,
    HomeRatingService,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    ReplyToReviewUseCase,
    ReportReviewUseCase,
  ],
  exports: [HomeRatingService],
})
export class ReviewModule {}
