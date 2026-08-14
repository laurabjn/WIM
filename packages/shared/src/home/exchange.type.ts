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
  // Le logement propose en retour par l'invite. Nul tant qu'il n'en propose pas.
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
  // L'autre personne de l'echange, et la conversation qui les relie : la carte
  // affiche son nom et le bouton y mene.
  partner: ExchangePartner | null;
  isHost: boolean;
  chatId: string | null;
  guestHomeId: string | null;
  guestHomeTitle: string | null;
  guestHomeImageUrl: string | null;
};