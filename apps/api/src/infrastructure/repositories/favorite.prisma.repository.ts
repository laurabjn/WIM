import { Injectable } from "@nestjs/common";
import { FavoriteRepository } from "src/domain/auth/repositories/favorite.repository";
import { HomeEntity } from "src/domain/auth/entities/home.entity";
import { PrismaService } from "../database/prisma/prisma.service";
import { HOME_WITH_RELATIONS_INCLUDE, mapHome } from "./home.mapper";

@Injectable()
export class FavoriteRepositoryPrisma implements FavoriteRepository {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, homeId: string) {
    await this.prisma.favorite.create({
      data: { userId, homeId },
    });
  }

  async remove(userId: string, homeId: string) {
    await this.prisma.favorite.delete({
      where: {
        userId_homeId: { userId, homeId },
      },
    });
  }

  async listByUser(userId: string): Promise<HomeEntity[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        home: {
          include: HOME_WITH_RELATIONS_INCLUDE,
        },
      },
    });

    return favorites.map((favorite) => mapHome(favorite.home));
  }
}