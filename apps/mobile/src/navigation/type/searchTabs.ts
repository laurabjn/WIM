export type SearchStackParamList = {
  Menu: undefined;
  Search: undefined;
  DestinationSearch: {
    currentDestination: string;
    onSelectDestination: (destination: string) => void;
    };
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