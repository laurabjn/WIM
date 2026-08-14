import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
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
    // Une donnee manquante est une faute de la requete, pas du serveur : sans
    // cela l'ecran ne recevait qu'une 500 muette.
    if (!input.title?.trim()) {
      throw new BadRequestException('Le titre est obligatoire.');
    }

    if (!input.description?.trim()) {
      throw new BadRequestException('La description est obligatoire.');
    }

    if (!input.city?.trim()) {
      throw new BadRequestException('La ville est obligatoire.');
    }

    if (!input.country?.trim()) {
      throw new BadRequestException('Le pays est obligatoire.');
    }

    if (input.capacity < 1) {
      throw new BadRequestException('La capacite doit valoir au moins 1.');
    }

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