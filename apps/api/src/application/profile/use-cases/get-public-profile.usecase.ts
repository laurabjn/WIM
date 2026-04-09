import type { ProfileRepository } from '../ports/profile.repository';

export class GetPublicProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string) {
    const profile = await this.profileRepository.getPublicProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }
}