import { Module } from '@nestjs/common';

import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
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
    BlockUserUseCase,
    UnblockUserUseCase,
    ReportUserUseCase,
    ListBlockedUsersUseCase,
    BlockedUsersService,
  ],
  exports: [BlockedUsersService],
})
export class ModerationModule {}
