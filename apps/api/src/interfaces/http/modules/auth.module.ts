import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUserUseCase } from 'src/application/auth/use-cases/register-user.usecase';
import { BcryptPasswordHasher } from 'src/application/auth/ports/bcrypt-password.hasher';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';
import { LoginUserUseCase } from 'src/application/auth/use-cases/login-user.usecase';
import {
  EMAIL_SENDER,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '../tokens/token';
import { JwtModule } from '@nestjs/jwt';
import { JwtPasswordResetTokenAdapter } from 'src/infrastructure/auth/jwt-password-reset-token.adapter';
import { PASSWORD_RESET_TOKEN } from 'src/application/auth/tokens/tokens';
import { ResetPasswordUseCase } from 'src/application/auth/use-cases/reset-password.usecase';
import { RequestPasswordResetUseCase } from 'src/application/auth/use-cases/request-password-reset.usecase';
import { ConsoleEmailSender } from 'src/infrastructure/notifications/console-email.sender';
import {
  isSmtpConfigured,
  NodemailerEmailSender,
} from 'src/infrastructure/notifications/nodemailer-email.sender';
import { IdentityModule } from './identity.module';
import { JwtStrategy } from '../jwt.strategy';
import { PassportModule } from '@nestjs/passport';

const ACCESS_TOKEN_TTL = '30m';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
    IdentityModule,
    PassportModule,
  ],
  providers: [
    PrismaService,
    UserPrismaRepository,
    BcryptPasswordHasher,
    JwtPasswordResetTokenAdapter,
    ConsoleEmailSender,
    NodemailerEmailSender,
    JwtStrategy,
    {
      provide: PASSWORD_RESET_TOKEN,
      useExisting: JwtPasswordResetTokenAdapter,
    },
    {
      provide: EMAIL_SENDER,
      useFactory: (
        nodemailer: NodemailerEmailSender,
        console_: ConsoleEmailSender,
      ) => (isSmtpConfigured() ? nodemailer : console_),
      inject: [NodemailerEmailSender, ConsoleEmailSender],
    },
    {
      provide: RequestPasswordResetUseCase,
      useFactory: (userRepo, tokenPort, emailSender) =>
        new RequestPasswordResetUseCase(
          userRepo,
          tokenPort,
          Number(process.env.JWT_RESET_TTL || 3600),
          emailSender,
          process.env.FRONTEND_URL || 'http://localhost:3001',
        ),
      inject: [USER_REPOSITORY, PASSWORD_RESET_TOKEN, EMAIL_SENDER],
    },
    {
      provide: ResetPasswordUseCase,
      useFactory: (userRepo, tokenPort, hasher) =>
        new ResetPasswordUseCase(userRepo, tokenPort, hasher),
      inject: [USER_REPOSITORY, PASSWORD_RESET_TOKEN, PASSWORD_HASHER],
    },
    {
      provide: USER_REPOSITORY,
      useExisting: UserPrismaRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useExisting: BcryptPasswordHasher,
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo, hasher) =>
        new RegisterUserUseCase(userRepo, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (userRepo, hasher) => new LoginUserUseCase(userRepo, hasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
  ],
  exports: [PASSWORD_HASHER, USER_REPOSITORY],
})
export class AuthModule {}
