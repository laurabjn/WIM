import { Module } from '@nestjs/common';

import { PushSenderService } from 'src/application/notification/push-sender.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { NotificationCenterService } from 'src/application/notification/notification-center.service';
import { NotificationController } from '../controllers/notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [PushSenderService, NotificationCenterService, PrismaService],
  exports: [PushSenderService, NotificationCenterService],
})
export class NotificationModule {}
