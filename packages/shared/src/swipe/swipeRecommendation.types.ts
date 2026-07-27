export type SwipeHomeType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'CABIN'
  | 'LOFT'
  | 'COTTAGE';

export type SwipeHomeMock = {
  id: string;
  ownerId: string;
    owner: {
    id: string;
    firstName: string;
    lastName: String;
    avatarUrl: string;
  };
  title: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number;
  homeType: SwipeHomeType;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  carExchangeAccepted: boolean;
  description: string;
  pricePerNight: number;
  averageRating: number;
  reviewsCount: number;
  amenities: string[];
  photos: Array<{
    url: string;
  }>;
};

export type SearchHistoryMock = {
  city?: string;
  country?: string;
  beds?: number;
  homeType?: SwipeHomeType;
  amenities?: string[];
  createdAt: string;
};

export type RecommendationUserMock = {
  id: string;
  likedHomeIds: string[];
  dislikedHomeIds: string[];
  favoriteHomeIds: string[];
  searchHistory: SearchHistoryMock[];
};

export type WeightedPreference = {
  value: string;
  weight: number;
  occurrences: number;
};

export type RecommendationProfile = {
  preferredCities: WeightedPreference[];
  preferredCountries: WeightedPreference[];
  preferredHomeTypes: WeightedPreference[];
  preferredAmenities: WeightedPreference[];

  dislikedCities: WeightedPreference[];
  dislikedHomeTypes: WeightedPreference[];
  dislikedAmenities: WeightedPreference[];

  averageBeds: number | null;
  averagePrice: number | null;
};

export type RecommendationDetails = {
  cityScore: number;
  countryScore: number;
  homeTypeScore: number;
  amenitiesScore: number;
  capacityScore: number;
  priceScore: number;
  qualityScore: number;
  searchScore: number;
  dislikePenalty: number;
  discoveryScore: number;
  totalScore: number;
};

export type RecommendedSwipeHome = SwipeHomeMock & {
  recommendationScore: number;
  recommendationDetails: RecommendationDetails;
};