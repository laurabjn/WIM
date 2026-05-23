import { HomeAvailabilityRepository } from "../../../domain/auth/repositories/home-availability.repository";

export class ListHomeAvailabilitiesUseCase {
  constructor(
    private readonly homeAvailabilityRepository: HomeAvailabilityRepository,
  ) {}

  async execute(homeId: string) {
    return this.homeAvailabilityRepository.findByHomeId(homeId);
  }
}