import { Module } from '@nestjs/common';
import { ListMyExchangesUseCase } from 'src/application/exchange/use-cases/list-my-exchanges.usecase';
import { RespondToExchangeUseCase } from 'src/application/exchange/use-cases/respond-to-exchange.usecase';
import { GetChatExchangeUseCase } from 'src/application/exchange/use-cases/get-chat-exchange.usecase';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ExchangeController } from '../controllers/ExchangeController';
import { ExchangeRepositoryPrisma } from 'src/infrastructure/repositories/exchange.prisma.repository';
import { ChatPrismaRepository } from 'src/infrastructure/repositories/chat.prisma.repository';
import { CHAT_REPOSITORY, EXCHANGE_REPOSITORY } from '../tokens/token';

@Module({
  controllers: [ExchangeController],
  providers: [
    PrismaService,
    ExchangeRepositoryPrisma,
    {
      provide: EXCHANGE_REPOSITORY,
      useExisting: ExchangeRepositoryPrisma,
    },
    {
      provide: CHAT_REPOSITORY,
      useClass: ChatPrismaRepository,
    },
    {
      provide: ListMyExchangesUseCase,
      useFactory: (repository: ExchangeRepositoryPrisma) =>
        new ListMyExchangesUseCase(repository),
      inject: [ExchangeRepositoryPrisma],
    },
    RespondToExchangeUseCase,
    GetChatExchangeUseCase,
  ],
})
export class ExchangeModule {}
