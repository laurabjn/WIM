export type SearchStackParamList = {
  Search: undefined;
  DestinationSearch: {
    currentDestination: string;
    onSelectDestination: (destination: string) => void;
    };
  SearchResults: {
    city: string;
    startDate: Date | null;
    endDate: Date | null;
    capacity: number | undefined;
  };
};