import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HomeAvailabilityRepository } from '../ports/home-availability.repository';

type HomeRepository = {
  findById(id: string): Promise<{ id: string; ownerId: string } | null>;
};

export class DeleteHomeAvailabilityUseCase {
  constructor(
    private readonly homeAvailabilityRepository: HomeAvailabilityRepository,
    private readonly homeRepository: HomeRepository,
  ) {}

  async execute(input: {
    homeId: string;
    availabilityId: string;
    userId: string;
  }) {
    const home = await this.homeRepository.findById(input.homeId);

    if (!home) {
      throw new NotFoundException('Logement introuvable');
    }

    if (home.ownerId !== input.userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres logements');
    }

    await this.homeAvailabilityRepository.delete({
      homeId: input.homeId,
      availabilityId: input.availabilityId,
    });
  }
}