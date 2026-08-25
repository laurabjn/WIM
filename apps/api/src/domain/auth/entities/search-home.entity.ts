export type HomeCategory = 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';

export type SearchHomesFilters = {
  userId: string;
  city?: string;
  country?: string;
  capacity?: number;
  bedrooms?: number;
  homeType?: string;
  amenities?: string[];
  category?: HomeCategory;
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
  category: HomeCategory | null;
  latitude: number | null;
  longitude: number | null;
  coverPhotoUrl: string | null;

  beds: number;
  bedrooms: number;
  averageRating: number | null;
  reviewsCount: number;
  isFavorite: boolean;
  photos: Array<{
    id: string;
    url: string;
    position: number;
  }>;

  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};