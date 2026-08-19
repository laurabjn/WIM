export type TravelPreferencesInput = {
  preferredCountries: string[];
  preferredHomeTypes: string[];
  minCapacity: number | null;
  maxCapacity: number | null;
  carExchangeAccepted: boolean | null;
  flexibleDates: boolean | null;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  nationality?: string;
  phone?: string;
  birthDate?: string;
  languages?: string[];
  preferredLocale?: 'fr' | 'en';
  travelPreferences?: Partial<TravelPreferencesInput>;
  profileVisible?: boolean;
  showAge?: boolean;
  dataSharing?: boolean;
  /** Chaine vide ou null pour retirer le statut. */
  statusText?: string | null;
  notifyNewMessages?: boolean;
};