import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
    CreateHomeAvailabilityInput,
    HomeAvailabilityRepository
} from '../../../domain/auth/repositories/home-availability.repository';


type HomeRepository = {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>;
};

export class CreateHomeAvailabilityUseCase {
  constructor(
    private readonly homeAvailabilityRepository: HomeAvailabilityRepository,
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(input: CreateHomeAvailabilityInput & { userId: string }) {
    if (input.startDate >= input.endDate) {
      throw new BadRequestException('La date de début doit être avant la date de fin');
    }

    const home = await this.homeRepository.findById(input.homeId);

    if (!home) {
      throw new NotFoundException('Logement introuvable');
    }

    if (home.ownerId !== input.userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres logements');
    }

    const overlaps = await this.homeAvailabilityRepository.findOverlapping({
      homeId: input.homeId,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    if (overlaps.length > 0) {
      throw new BadRequestException('Cette période chevauche déjà une disponibilité existante');
    }

    return this.homeAvailabilityRepository.create({
      homeId: input.homeId,
      startDate: input.startDate,
      endDate: input.endDate,
      type: input.type,
    });
  }
}