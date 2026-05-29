import { Module } from '@nestjs/common';
import { ListMyExchangesUseCase } from 'src/application/exchange/use-cases/list-my-exchanges.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ExchangeController } from '../controllers/ExchangeController';
import { ExchangeRepositoryPrisma } from 'src/infrastructure/repositories/exchange.prisma.repository';

@Module({
  controllers: [ExchangeController],
  providers: [
    PrismaService,
    ExchangeRepositoryPrisma,
    {
      provide: ListMyExchangesUseCase,
      useFactory: (repository: ExchangeRepositoryPrisma) =>
        new ListMyExchangesUseCase(repository),
      inject: [ExchangeRepositoryPrisma],
    },
  ],
})
export class ExchangeModule {}