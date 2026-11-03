export type SearchStackParamList = {
  Menu: undefined;
  Search: undefined;
  SearchResults: {
    city: string;
    category?: 'NATURE' | 'BEACH' | 'CITY' | 'CULTURE';
    startDate?: string;
    endDate?: string;
    capacity: number | undefined;
    bedrooms?: number;
    homeType?: string;
    amenities?: string[];
  };
  Swipe:
    | {
        restoreHomeId?: string;
        restoreIndex?: number;
      }
    | undefined;
  HomeDetails: {
    homeId: string;
  };
  PublicProfile: {
    userId: string;
  };
  SwipeHomeDetails: {
    homeId: string;
    swipeIndex: number;
  };
};