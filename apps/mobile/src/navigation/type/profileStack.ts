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
  BlockedUsers: undefined;
  Admin: undefined;
  PublicProfile: { userId: string };
  Help: undefined;
  Support: { mode?: 'report' } | undefined;
  HomeDetails: { homeId: string };
  EditHome: { homeId?: string } | undefined;
  ExchangeAvailability: { homeId: string };
  ExchangeMessage: {
    homeId: string;
    availabilityType: string
  };
};