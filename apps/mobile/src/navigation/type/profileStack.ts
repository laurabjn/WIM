import { UserProfile } from "@wim/shared";

export type ProfileStackParamList = {
  ProfileMain: { updatedProfile?: UserProfile } | undefined;
  EditProfile: { profile: UserProfile };
  Preferences: { profile: UserProfile };
  Favorites: undefined;
  Settings: { profile: UserProfile };
  PublicProfile: { userId: string };
};