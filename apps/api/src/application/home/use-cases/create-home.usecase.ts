import { Inject, Injectable } from '@nestjs/common';
import { CreateHomeInput } from '../dto/create-home.input';
import { HomeRepository } from 'src/domain/auth/repositories/home.repository';
import { HOME_REPOSITORY } from 'src/interfaces/http/tokens/token';

@Injectable()
export class CreateHomeUseCase {
  constructor(
    @Inject(HOME_REPOSITORY)
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(input: CreateHomeInput) {
    if (!input.title.trim()) throw new Error('Title is required');
    if (!input.description.trim()) throw new Error('Description is required');
    if (!input.city.trim()) throw new Error('City is required');
    if (!input.country.trim()) throw new Error('Country is required');
    if (input.capacity < 1) throw new Error('Capacity must be at least 1');

    return this.homeRepository.create({
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      country: input.country.trim(),
      amenities: input.amenities ?? [],
      beds: input.beds,
      bathrooms: input.bathrooms,
      vehicle: input.vehicle ?? null,
    });
  }
}