import type { ProfileRepository } from '../ports/profile.repository';
import type { UserProfile } from '@wim/shared';

export class UploadMyAvatarUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string, avatarUrl: string): Promise<UserProfile> {
    if (!avatarUrl) {
      throw new Error('avatarUrl is required');
    }

    return this.profileRepository.updateAvatar(userId, avatarUrl);
  }
}