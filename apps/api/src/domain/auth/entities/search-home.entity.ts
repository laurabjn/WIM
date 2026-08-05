export type SearchHomesFilters = {
  userId: string;
  city?: string;
  country?: string;
  capacity?: number;
  homeType?: string;
  startDate?: string;
  endDate?: string;
};

export type HomeSearchResult = {
  id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  capacity: number;
  homeType: string;
  latitude: number | null;
  longitude: number | null;
  coverPhotoUrl: string | null;

  // Champs attendus par les cartes de résultats. Sans eux, la carte affichait
  // « undefined Chambres » et une note vide : c'est pour cette raison que
  // l'écran de résultats s'appuyait encore sur des données fictives.
  beds: number;
  bedrooms: number;
  averageRating: number | null;
  reviewsCount: number;
  // Etat du favori pour l'utilisateur qui effectue la recherche : sans lui,
  // l'etoile des resultats repartait systematiquement a vide.
  isFavorite: boolean;
  photos: Array<{
    id: string;
    url: string;
    position: number;
  }>;

  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};