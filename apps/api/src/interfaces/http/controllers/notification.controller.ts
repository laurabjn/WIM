import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';

import { PushSenderService } from 'src/application/notification/push-sender.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

type AuthenticatedRequest = { user?: { sub?: string } };

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly pushSender: PushSenderService) {}

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
