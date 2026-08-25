import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  DeleteReviewUseCase,
  ReplyToReviewUseCase,
  ReportReviewUseCase,
  UpdateReviewUseCase,
} from 'src/application/home/use-cases/manage-reviews.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';

type AuthenticatedRequest = { user?: { sub?: string } };

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(
    private readonly updateReview: UpdateReviewUseCase,
    private readonly deleteReview: DeleteReviewUseCase,
    private readonly replyToReview: ReplyToReviewUseCase,
    private readonly reportReview: ReportReviewUseCase,
  ) {}

  @Patch(':reviewId')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('reviewId') reviewId: string,
    @Body() body: { score?: number; comment?: string },
  ) {
    return this.updateReview.execute(
      reviewId,
      request.user?.sub ?? '',
      Number(body?.score),
      body?.comment ?? '',
    );
  }

  @Delete(':reviewId')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('reviewId') reviewId: string,
  ) {
    await this.deleteReview.execute(reviewId, request.user?.sub ?? '');

    return { deleted: true };
  }

  @Post(':reviewId/reply')
  async reply(
    @Req() request: AuthenticatedRequest,
    @Param('reviewId') reviewId: string,
    @Body() body: { reply?: string },
  ) {
    return this.replyToReview.execute(
      reviewId,
      request.user?.sub ?? '',
      body?.reply ?? '',
    );
  }

  @Post(':reviewId/report')
  async report(
    @Req() request: AuthenticatedRequest,
    @Param('reviewId') reviewId: string,
    @Body() body: { reason?: string },
  ) {
    return this.reportReview.execute(
      reviewId,
      request.user?.sub ?? '',
      body?.reason ?? '',
    );
  }
}
