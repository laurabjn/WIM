import { Module } from '@nestjs/common';
import { HomeAvailabilityController } from '../controllers/home-availability.controller';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { HomeAvailabilityRepositoryPrisma } from 'src/infrastructure/repositories/home-availability.prisma.repository';
import { HomeRepositoryPrisma } from 'src/infrastructure/repositories/home.prisma.repository';
import { CreateHomeAvailabilityUseCase } from 'src/application/home/use-cases/create-home-availability.usecase';
import { ListHomeAvailabilitiesUseCase } from 'src/application/home/use-cases/list-home-availabilities.usecase';
import { DeleteHomeAvailabilityUseCase } from 'src/application/home/use-cases/delete-home-availability.usecase';

@Module({
  controllers: [HomeAvailabilityController],
  providers: [
    PrismaService,
    HomeAvailabilityRepositoryPrisma,
    HomeRepositoryPrisma,
    {
      provide: CreateHomeAvailabilityUseCase,
      useFactory: (
        availabilityRepository: HomeAvailabilityRepositoryPrisma,
        homeRepository: HomeRepositoryPrisma,
      ) => new CreateHomeAvailabilityUseCase(availabilityRepository, homeRepository),
      inject: [HomeAvailabilityRepositoryPrisma, HomeRepositoryPrisma],
    },
    {
      provide: ListHomeAvailabilitiesUseCase,
      useFactory: (availabilityRepository: HomeAvailabilityRepositoryPrisma) =>
        new ListHomeAvailabilitiesUseCase(availabilityRepository),
      inject: [HomeAvailabilityRepositoryPrisma],
    },
    {
      provide: DeleteHomeAvailabilityUseCase,
      useFactory: (
        availabilityRepository: HomeAvailabilityRepositoryPrisma,
        homeRepository: HomeRepositoryPrisma,
      ) => new DeleteHomeAvailabilityUseCase(availabilityRepository, homeRepository),
      inject: [HomeAvailabilityRepositoryPrisma, HomeRepositoryPrisma],
    },
  ],
})
export class HomeAvailabilityModule {}