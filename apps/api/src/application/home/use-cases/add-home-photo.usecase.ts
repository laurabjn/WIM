import { Inject, Injectable } from '@nestjs/common';
import { AddHomePhotoInput } from '../dto/add-home-photo.input';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HomeNotFoundError } from 'src/domain/auth/errors/home-not-found.error';
import { ForbiddenHomeAccessError } from 'src/domain/auth/errors/forbidden-home-access.error';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class AddHomePhotoUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(input: AddHomePhotoInput) {
    const home = await this.homeRepository.findById(input.homeId);
    if (!home) throw new HomeNotFoundError();
    if (home.ownerId !== input.requesterId) throw new ForbiddenHomeAccessError();

    const position = input.position ?? home.photos.length;
    return this.homeRepository.addPhoto(input.homeId, input.url, position);
  }
}