import { UserProfile } from "@wim/shared";

export type ProfileStackParamList = {
  ProfileMain: { updatedProfile?: UserProfile } | undefined;
  EditProfile: { profile: UserProfile };
  Preferences: {
    profile: UserProfile;
    updatedRegionSelection?: {
      region: string;
      selectedItems: string[];
    };
  };
  RegionDestinations: {
    profile: UserProfile;
    region: string;
    selectedItems: string[];
  };
  Favorites: undefined;
  Settings: { profile: UserProfile };
  PublicProfile: { userId: string };
  Help: undefined;
  HomeDetails: { homeId: string };
};