import { Inject, Injectable } from '@nestjs/common';
import { ForbiddenHomeAccessError } from 'src/domain/auth/errors/forbidden-home-access.error';
import { HomeNotFoundError } from 'src/domain/auth/errors/home-not-found.error';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class DeleteHomeUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(homeId: string, requesterId: string) {
    const home = await this.homeRepository.findById(homeId);
    if (!home) throw new HomeNotFoundError();
    if (home.ownerId !== requesterId) throw new ForbiddenHomeAccessError();

    await this.homeRepository.delete(homeId);
  }
}