import type { ProfileRepository } from '../ports/profile.repository';
import type { UserProfile } from '@wim/shared';

export class GetMyProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.getMyProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }
}