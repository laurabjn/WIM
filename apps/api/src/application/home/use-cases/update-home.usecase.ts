import { Inject, Injectable } from '@nestjs/common';
import { UpdateHomeInput } from '../dto/update-home.input';
import { HomeNotFoundError } from 'src/domain/auth/errors/home-not-found.error';
import { ForbiddenHomeAccessError } from 'src/domain/auth/errors/forbidden-home-access.error';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class UpdateHomeUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(input: UpdateHomeInput) {
    const home = await this.homeRepository.findById(input.homeId);
    if (!home) throw new HomeNotFoundError();
    if (home.ownerId !== input.requesterId) throw new ForbiddenHomeAccessError();

    return this.homeRepository.update(input.homeId, {
      title: input.title?.trim(),
      description: input.description?.trim(),
      address: input.address,
      city: input.city?.trim(),
      country: input.country?.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      capacity: input.capacity,
      homeType: input.homeType,
      amenities: input.amenities,
      carExchangeAccepted: input.carExchangeAccepted,
      beds: input.beds,
      bathrooms: input.bathrooms,
      vehicle: input.vehicle ?? null,
    });
  }
}