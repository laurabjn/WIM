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
  guestHomeId: string | null;
  guestHomeTitle: string | null;
  guestHomeImageUrl: string | null;
};

export type ExchangePartner = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
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
  partner: ExchangePartner | null;
  isHost: boolean;
  chatId: string | null;
  guestHomeId: string | null;
  guestHomeTitle: string | null;
  guestHomeImageUrl: string | null;
};