import { Inject } from '@nestjs/common';
import { FavoriteRepository } from 'src/domain/auth/repositories/favorite.repository';
import { FAVORITE_REPOSITORY } from 'src/interfaces/http/tokens/token';

export class RemoveFavoriteUseCase {
  constructor(
    @Inject(FAVORITE_REPOSITORY)
    private readonly favoriteRepository: FavoriteRepository,
  ) {}

  async execute(userId: string, homeId: string): Promise<void> {
    if (!userId || !homeId) {
      throw new Error('Invalid parameters');
    }

    await this.favoriteRepository.remove(userId, homeId);
  }
}