export type ExchangeStatus =
  | 'PENDING'
  | 'DECLINED'
  | 'CURRENT'
  | 'FUTURE'
  | 'PAST'
  | 'CANCELLED';

export type PendingExchange = {
  id: string;
  homeId: string;
  homeTitle: string;
  homeImageUrl: string | null;
  location: string;
  startDate: string;
  endDate: string;
  travelersCount: number;
  status: ExchangeStatus;
  hostId: string;
  guestId: string;
  isHost: boolean;
};

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