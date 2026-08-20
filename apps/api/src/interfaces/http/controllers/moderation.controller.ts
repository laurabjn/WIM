import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  BlockUserUseCase,
  ListBlockedUsersUseCase,
  ReportUserUseCase,
  UnblockUserUseCase,
} from 'src/application/moderation/moderation.usecases';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(
    private readonly blockUser: BlockUserUseCase,
    private readonly unblockUser: UnblockUserUseCase,
    private readonly reportUser: ReportUserUseCase,
    private readonly listBlocked: ListBlockedUsersUseCase,
  ) {}

  @Get('blocked')
  async blocked(@Req() req: any) {
    return this.listBlocked.execute(req.user.sub);
  }

  @Post('block/:userId')
  async block(@Req() req: any, @Param('userId') userId: string) {
    await this.blockUser.execute(req.user.sub, userId);

    return { blocked: true };
  }

  @Delete('block/:userId')
  async unblock(@Req() req: any, @Param('userId') userId: string) {
    await this.unblockUser.execute(req.user.sub, userId);

    return { blocked: false };
  }

  @Post('report/:userId')
  async report(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() body: { reason: string; message?: string },
  ) {
    return this.reportUser.execute(
      req.user.sub,
      userId,
      body?.reason,
      body?.message,
    );
  }
}
