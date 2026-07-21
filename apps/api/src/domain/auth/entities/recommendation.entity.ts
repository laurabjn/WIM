export type RecommendationHome = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  homeType: string;
  amenities: string[];
  carExchangeAccepted: boolean;
  photos: Array<{
    id: string;
    url: string;
    position: number;
  }>;
};

export type WeightedPreference = {
  value: string;
  weight: number;
};

export type UserRecommendationProfile = {
  preferredCities: WeightedPreference[];
  preferredCountries: WeightedPreference[];
  preferredHomeTypes: WeightedPreference[];
  preferredAmenities: WeightedPreference[];

  averageCapacity: number | null;

  dislikedCities: WeightedPreference[];
  dislikedHomeTypes: WeightedPreference[];
  dislikedAmenities: WeightedPreference[];

  lastSearchLatitude: number | null;
  lastSearchLongitude: number | null;
};

export type RecommendationScoreDetails = {
  searchScore: number;
  favoriteScore: number;
  likeScore: number;
  dislikePenalty: number;
  profileScore: number;
  qualityScore: number;
  discoveryScore: number;
  totalScore: number;
};

export type ScoredHome = {
  home: RecommendationHome;
  score: number;
  details: RecommendationScoreDetails;
};