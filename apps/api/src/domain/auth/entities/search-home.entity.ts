export type SearchHomesFilters = {
  userId: string;
  city?: string;
  country?: string;
  capacity?: number;
  homeType?: string;
  startDate?: string;
  endDate?: string;
};

export type HomeSearchResult = {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  capacity: number;
  homeType: string;
  latitude: number | null;
  longitude: number | null;
  coverPhotoUrl: string | null;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};