export type HomesStackParamList = {
  MyHomes: undefined;
  HomeDetails: { homeId: string };
  PublicProfile: { userId: string };
  CreateHomePhotos: undefined;
  CreateHomeDescription: undefined;
  CreateHomeLocation: undefined;
  CreateHomeCapacity: undefined;
  EditHome: { homeId?: string } | undefined;
  ExchangeAvailability: {
    homeId: string;
  };
  ExchangeMessage: {
    homeId: string;
    availabilityType: 'FREE' | 'EXCHANGER_DATES' | 'SPECIFIC_DATES';
    startDate?: string;
    endDate?: string;
  };
};