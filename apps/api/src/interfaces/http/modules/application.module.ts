// src/interfaces/http/modules/application.module.ts
import { Module } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.usecase';
import { GetHealthUseCase } from '../../../application/use-cases/get-health.usecase';
import { TOKENS } from '../../../application/tokens/tokens';
import { InfrastructureModule } from '../../../infrastructure/modules/infrastructure.module';
import { UserPrismaRepository } from '../../../infrastructure/repositories/user.prisma.repository';

@Module({
  imports: [InfrastructureModule],
  providers: [
    GetHealthUseCase,

    // Repo binding
    { provide: TOKENS.UserRepository, useClass: UserPrismaRepository },

    // Use-case binding (pas de Nest dans application)
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo) => new RegisterUserUseCase(userRepo),
      inject: [TOKENS.UserRepository],
    },
  ],
  exports: [GetHealthUseCase, RegisterUserUseCase],
})
export class ApplicationModule {}
