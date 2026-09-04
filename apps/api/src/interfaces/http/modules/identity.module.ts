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
import { PushSenderService } from 'src/application/notification/push-sender.service';
import { ConsoleEmailSender } from 'src/infrastructure/notifications/console-email.sender';
import {
  NodemailerEmailSender,
  isSmtpConfigured,
} from 'src/infrastructure/notifications/nodemailer-email.sender';
import { IdentityController } from '../controllers/identity.controller';
import {
  EMAIL_SENDER,
  IDENTITY_PROVIDER,
  USER_REPOSITORY,
} from '../tokens/token';

@Module({
  controllers: [IdentityController],
  providers: [
    PrismaService,
    UserPrismaRepository,
    StripeIdentityProvider,
    MockIdentityProvider,
    PushSenderService,
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
      useFactory: (userRepo, push, email) =>
        new ApplyIdentityVerdictUseCase(userRepo, push, email),
      inject: [USER_REPOSITORY, PushSenderService, EMAIL_SENDER],
    },
  ],
  exports: [
    StartIdentityVerificationUseCase,
    GetIdentityStatusUseCase,
    ApplyIdentityVerdictUseCase,
  ],
})
export class IdentityModule {}
