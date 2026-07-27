export type SearchStackParamList = {
  Menu: undefined;
  Search: undefined;
  DestinationSearch: {
    currentDestination: string;
    onSelectDestination: (destination: string) => void;
    };
  SearchResults: {
    city: string;
    startDate?: string;
    endDate?: string;
    capacity: number | undefined;
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
  SwipeHomeDetails: {
    homeId: string;
    swipeIndex: number;
  };
};