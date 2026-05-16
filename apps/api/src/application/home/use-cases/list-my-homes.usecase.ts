import { Inject, Injectable } from '@nestjs/common';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class ListMyHomesUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  execute(ownerId: string) {
    return this.homeRepository.findByOwnerId(ownerId);
  }
}