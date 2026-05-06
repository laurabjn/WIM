import { Inject } from '@nestjs/common';
import { HomeEntity } from 'src/domain/auth/entities/home.entity';
import { FAVORITE_REPOSITORY } from 'src/interfaces/http/tokens/token';
import { FavoriteRepository } from 'src/domain/auth/repositories/favorite.repository';

export class ListFavoritesUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(userId: string): Promise<HomeEntity[]> {
    if (!userId) {
      throw new Error('Invalid userId');
    }

    return this.favoriteRepository.listByUser(userId);
  }
}