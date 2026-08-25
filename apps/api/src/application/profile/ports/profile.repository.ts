import type { UserProfile } from '@wim/shared';
import { UpdateProfileInput } from '../dto/update-my-profile.dto';

export interface ProfileRepository {
  getMyProfile(userId: string): Promise<UserProfile | null>;
  getPublicProfile(userId: string): Promise<Partial<UserProfile> | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile>;
  updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile>;
}