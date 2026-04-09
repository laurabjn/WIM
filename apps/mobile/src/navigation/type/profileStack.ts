import { UserProfile } from "@wim/shared";

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Preferences: { profile: UserProfile };
  Favorites: undefined;
  Settings: { profile: UserProfile };
  PublicProfile: { userId: string };
};