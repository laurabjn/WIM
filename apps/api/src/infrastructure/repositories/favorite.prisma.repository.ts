import { Injectable } from "@nestjs/common";
import { FavoriteRepository } from "src/domain/auth/repositories/favorite.repository";
import { PrismaService } from "../database/prisma/prisma.service";

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

  async listByUser(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        home: {
          include: {
            photos: true,
            owner: true,
          },
        },
      },
    });

    return favorites.map((f) => f.home);
  }
}