import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user.usecase';
import { BcryptPasswordHasher } from 'src/application/ports/bcrypt-password.hasher';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { UserPrismaRepository } from 'src/infrastructure/repositories/user.prisma.repository';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

@Module({
  controllers: [AuthController],
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
  ],
  exports: [],
})
export class AuthModule {}
