export type ExchangeStatus = 'CURRENT' | 'FUTURE' | 'PAST';

export type Exchange = {
  id: string;
  homeId: string;
  homeTitle: string;
  homeImageUrl: string | null;
  location: string;
  startDate: string;
  endDate: string;
  travelersCount: number;
  status: ExchangeStatus;
};