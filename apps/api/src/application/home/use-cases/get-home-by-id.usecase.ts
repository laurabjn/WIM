import { Inject, Injectable } from '@nestjs/common';
import { HomeNotFoundError } from 'src/domain/auth/errors/home-not-found.error';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class GetHomeByIdUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(homeId: string) {
    console.log('Executing GetHomeByIdUseCase with homeId:', homeId);
    const home = await this.homeRepository.findById(homeId);
    if (!home) throw new HomeNotFoundError();
    return home;
  }
}