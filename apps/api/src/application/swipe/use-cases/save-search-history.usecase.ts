import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

export type SaveSearchHistoryInput = {
  userId: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  startDate?: Date;
  endDate?: Date;
};

@Injectable()
export class SaveSearchHistoryUseCase {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: SaveSearchHistoryInput) {
    return this.prisma.searchHistory.create({
      data: {
        userId: input.userId,
        city: input.city?.trim() || null,
        country: input.country?.trim() || null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        capacity: input.capacity ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
      },
    });
  }
}