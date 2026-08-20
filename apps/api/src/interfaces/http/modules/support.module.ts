import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { CreateSupportRequestUseCase } from 'src/application/support/use-cases/create-support-request.usecase';
import { SupportController } from '../controllers/support.controller';
import { PrismaSupportRequestRepository } from 'src/infrastructure/repositories/support.prisma.repository';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';
import { USER_REPOSITORY } from '../tokens/token';

@Module({
  controllers: [SupportController],
  providers: [
    PrismaService,
    PrismaSupportRequestRepository,
    UserPrismaRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: UserPrismaRepository,
    },
    {
      provide: CreateSupportRequestUseCase,
      useFactory: (repo: PrismaSupportRequestRepository, userRepo) =>
        new CreateSupportRequestUseCase(repo, userRepo),
      inject: [PrismaSupportRequestRepository, USER_REPOSITORY],
    },
  ],
})
export class SupportModule {}