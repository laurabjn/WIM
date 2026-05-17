import { Injectable } from '@nestjs/common';
import {
    CreateHomeAvailabilityInput,
    HomeAvailabilityRepository
} from 'src/application/home/ports/home-availability.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { HomeAvailabilityEntity } from 'src/domain/auth/entities/home-availability.entity';

@Injectable()
export class HomeAvailabilityRepositoryPrisma implements HomeAvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateHomeAvailabilityInput): Promise<HomeAvailabilityEntity> {
    return this.prisma.homeAvailability.create({
      data: {
        homeId: input.homeId,
        startDate: input.startDate,
        endDate: input.endDate,
        type: input.type,
      },
    });
  }

  async findByHomeId(homeId: string): Promise<HomeAvailabilityEntity[]> {
    return this.prisma.homeAvailability.findMany({
      where: { homeId },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOverlapping(params: {
    homeId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<HomeAvailabilityEntity[]> {
    return this.prisma.homeAvailability.findMany({
      where: {
        homeId: params.homeId,
        startDate: {
          lt: params.endDate,
        },
        endDate: {
          gt: params.startDate,
        },
      },
    });
  }

  async delete(params: {
    availabilityId: string;
    homeId: string;
  }): Promise<void> {
    await this.prisma.homeAvailability.deleteMany({
      where: {
        id: params.availabilityId,
        homeId: params.homeId,
      },
    });
  }
}