import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user.usecase';
import { BcryptPasswordHasher } from 'src/application/ports/bcrypt-password.hasher';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';
import { LoginUserUseCase } from 'src/application/use-cases/login-user.usecase';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../tokens/token';
import { JwtModule } from '@nestjs/jwt';

const ACCESS_TOKEN_TTL = '15m';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      signOptions: { expiresIn: ACCESS_TOKEN_TTL },
    }),
  ],
  providers: [
    PrismaService,
    UserPrismaRepository,
    BcryptPasswordHasher,
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
