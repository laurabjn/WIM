import { Module } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { CreateSupportRequestUseCase } from 'src/application/support/use-cases/create-support-request.usecase';
import { SupportController } from '../controllers/support.controller';
import { PrismaSupportRequestRepository } from 'src/infrastructure/repositories/support.prisma.repository';

@Module({
  controllers: [SupportController],
  providers: [
    PrismaService,
    PrismaSupportRequestRepository,
    {
      provide: CreateSupportRequestUseCase,
      useFactory: (repo: PrismaSupportRequestRepository) =>
        new CreateSupportRequestUseCase(repo),
      inject: [PrismaSupportRequestRepository],
    },
  ],
})
export class SupportModule {}