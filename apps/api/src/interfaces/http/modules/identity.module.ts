import { Module } from '@nestjs/common';

import { ApplyIdentityVerdictUseCase } from 'src/application/auth/use-cases/apply-identity-verdict.usecase';
import { GetIdentityStatusUseCase } from 'src/application/auth/use-cases/get-identity-status.usecase';
import { StartIdentityVerificationUseCase } from 'src/application/auth/use-cases/start-identity-verification.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { MockIdentityProvider } from 'src/infrastructure/identity/mock-identity.provider';
import {
  StripeIdentityProvider,
  isStripeIdentityConfigured,
} from 'src/infrastructure/identity/stripe-identity.provider';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';
import { IdentityController } from '../controllers/identity.controller';
import { IDENTITY_PROVIDER, USER_REPOSITORY } from '../tokens/token';

@Module({
  controllers: [IdentityController],
  providers: [
    PrismaService,
    UserPrismaRepository,
    StripeIdentityProvider,
    MockIdentityProvider,
    {
      provide: USER_REPOSITORY,
      useExisting: UserPrismaRepository,
    },
    {
      provide: IDENTITY_PROVIDER,
      useFactory: (
        stripe: StripeIdentityProvider,
        simule: MockIdentityProvider,
      ) => (isStripeIdentityConfigured() ? stripe : simule),
      inject: [StripeIdentityProvider, MockIdentityProvider],
    },
    {
      provide: StartIdentityVerificationUseCase,
      useFactory: (userRepo, provider) =>
        new StartIdentityVerificationUseCase(userRepo, provider),
      inject: [USER_REPOSITORY, IDENTITY_PROVIDER],
    },
    {
      provide: GetIdentityStatusUseCase,
      useFactory: (userRepo) => new GetIdentityStatusUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
    {
      provide: ApplyIdentityVerdictUseCase,
      useFactory: (userRepo) => new ApplyIdentityVerdictUseCase(userRepo),
      inject: [USER_REPOSITORY],
    },
  ],
  exports: [
    StartIdentityVerificationUseCase,
    GetIdentityStatusUseCase,
    ApplyIdentityVerdictUseCase,
  ],
})
export class IdentityModule {}
