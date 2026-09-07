import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { NotificationCenterService } from 'src/application/notification/notification-center.service';
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

type AuthenticatedRequest = { user?: { sub?: string } };

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly pushSender: PushSenderService,
    private readonly centre: NotificationCenterService,
  ) {}

  @Get()
  async lister(
    @Req() request: AuthenticatedRequest,
    @Query('cursor') curseur?: string,
  ) {
    return this.centre.lister(request.user?.sub ?? '', curseur);
  }

  @Get('unread-count')
  async nonLues(@Req() request: AuthenticatedRequest) {
    return {
      count: await this.centre.compterNonLues(request.user?.sub ?? ''),
    };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async toutLire(@Req() request: AuthenticatedRequest) {
    await this.centre.toutMarquerLu(request.user?.sub ?? '');

    return { read: true };
  }

  @Post(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  async lire(
    @Req() request: AuthenticatedRequest,
    @Param('notificationId') notificationId: string,
  ) {
    await this.centre.marquerLue(request.user?.sub ?? '', notificationId);

    return { read: true };
  }

  @Post('token')
  async register(
    @Req() request: AuthenticatedRequest,
    @Body() body: { token?: string; platform?: string },
  ) {
    if (!body?.token) return { registered: false };

    await this.pushSender.registerToken(
      request.user?.sub ?? '',
      body.token,
      body.platform,
    );

    return { registered: true };
  }

  @Delete('token')
  async unregister(@Body() body: { token?: string }) {
    if (body?.token) await this.pushSender.removeToken(body.token);

    return { registered: false };
  }
}
