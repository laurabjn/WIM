import { Inject, Injectable } from '@nestjs/common';
import { HomeNotFoundError } from 'src/domain/auth/errors/home-not-found.error';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';
import {
  distanceEnKm,
  exprimer,
  type Distance,
} from 'src/shared/utils/distance';

@Injectable()
export class GetHomeByIdUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(homeId: string, viewerId?: string) {
    const home = await this.homeRepository.findById(homeId);

    if (!home) throw new HomeNotFoundError();

    const distance = viewerId
      ? await this.distanceDepuisChez(viewerId, home)
      : null;

    return { ...home, distance };
  }

  private async distanceDepuisChez(
    viewerId: string,
    home: { ownerId: string; latitude?: number | null; longitude?: number | null },
  ): Promise<Distance | null> {
    if (viewerId === home.ownerId) return null;
    if (home.latitude == null || home.longitude == null) return null;

    const [chezMoi, compte] = await Promise.all([
      this.prisma.home.findFirst({
        where: {
          ownerId: viewerId,
          latitude: { not: null },
          longitude: { not: null },
        },
        orderBy: { createdAt: 'asc' },
        select: { latitude: true, longitude: true },
      }),
      this.prisma.user.findUnique({
        where: { id: viewerId },
        select: { distanceUnit: true },
      }),
    ]);

    if (!chezMoi?.latitude || !chezMoi.longitude) return null;

    const km = distanceEnKm(
      chezMoi.latitude,
      chezMoi.longitude,
      home.latitude,
      home.longitude,
    );

    return exprimer(km, compte?.distanceUnit === 'mi' ? 'mi' : 'km');
  }
}