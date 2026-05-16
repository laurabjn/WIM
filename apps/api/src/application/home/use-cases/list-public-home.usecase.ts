import { Inject, Injectable } from '@nestjs/common';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class ListPublicHomesUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  execute() {
    return this.homeRepository.findAll();
  }
}