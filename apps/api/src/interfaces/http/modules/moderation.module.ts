import { Module } from '@nestjs/common';
import { AdminAlertService } from 'src/application/moderation/admin-alert.service';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ConsoleEmailSender } from 'src/infrastructure/notifications/console-email.sender';
import {
  NodemailerEmailSender,
  isSmtpConfigured,
} from 'src/infrastructure/notifications/nodemailer-email.sender';
import { EMAIL_SENDER } from '../tokens/token';
import { ModerationController } from '../controllers/moderation.controller';
import { BlockedUsersService } from 'src/application/moderation/blocked-users.service';
import {
  BlockUserUseCase,
  ListBlockedUsersUseCase,
  ReportUserUseCase,
  UnblockUserUseCase,
} from 'src/application/moderation/moderation.usecases';

@Module({
  controllers: [ModerationController],
  providers: [
    PrismaService,
    ConsoleEmailSender,
    NodemailerEmailSender,
    {
      provide: EMAIL_SENDER,
      useFactory: (
        nodemailer: NodemailerEmailSender,
        console_: ConsoleEmailSender,
      ) => (isSmtpConfigured() ? nodemailer : console_),
      inject: [NodemailerEmailSender, ConsoleEmailSender],
    },
    AdminAlertService,
    BlockUserUseCase,
    UnblockUserUseCase,
    ReportUserUseCase,
    ListBlockedUsersUseCase,
    BlockedUsersService,
  ],
  exports: [BlockedUsersService, AdminAlertService],
})
export class ModerationModule {}
