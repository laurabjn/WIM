import type { UserProfile } from '@wim/shared';
import type { ProfileRepository } from '../ports/profile.repository';
import { UpdateProfileInput } from '../dto/update-my-profile.dto';

export class UpdateMyProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    if (
      input.preferredLocale &&
      input.preferredLocale !== 'fr' &&
      input.preferredLocale !== 'en'
    ) {
      throw new Error('Invalid locale');
    }

    if (input.languages && !Array.isArray(input.languages)) {
      throw new Error('languages must be an array');
    }

    return this.profileRepository.updateProfile(userId, input);
  }
}