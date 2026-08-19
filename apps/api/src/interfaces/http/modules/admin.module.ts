import { Module } from '@nestjs/common';

import {
  GetAdminStatsUseCase,
  ListReportsUseCase,
  MarkReportHandledUseCase,
  SuspendUserUseCase,
} from 'src/application/admin/admin-moderation.usecases';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { AdminController } from '../controllers/admin.controller';

@Module({
  controllers: [AdminController],
  providers: [
    PrismaService,
    GetAdminStatsUseCase,
    ListReportsUseCase,
    MarkReportHandledUseCase,
    SuspendUserUseCase,
  ],
})
export class AdminModule {}
