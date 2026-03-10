import { Module } from '@nestjs/common';
import { IdentityController } from '../controllers/identity.controller';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';
import { USER_REPOSITORY } from '../tokens/token';
import { StartIdentityVerificationUseCase } from 'src/application/auth/use-cases/start-identity-verification.usecase';
import { GetIdentityStatusUseCase } from 'src/application/auth/use-cases/get-identity-status.usecase';

@Module({
  controllers: [IdentityController],
  providers: [
    PrismaService,
    UserPrismaRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: UserPrismaRepository,
    },
    {
      provide: StartIdentityVerificationUseCase,
      useFactory: (userRepo, provider) =>
        new StartIdentityVerificationUseCase(userRepo, provider),
      inject: [USER_REPOSITORY],
    },
    {
      provide: GetIdentityStatusUseCase,
      useFactory: (userRepo) => new GetIdentityStatusUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [StartIdentityVerificationUseCase, GetIdentityStatusUseCase],
})
export class IdentityModule {}
