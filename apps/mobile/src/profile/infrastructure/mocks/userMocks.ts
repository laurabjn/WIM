import type { UserProfile } from '@wim/shared';

export const publicUserMock: UserProfile = {
  id: 'user-1',

  email: 'terry@example.com',

  firstName: 'Terry',
  lastName: 'Johnson',

  age: 32,

  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',

  bio: `Voyageur passionné et amateur d’échanges culturels. 
J’adore découvrir de nouveaux endroits et accueillir des voyageurs du monde entier.`,

  country: 'États-Unis',
  nationality: 'Américain',

  phone: null,

  birthDate: '1993-05-12',

  languages: ['Anglais', 'Français'],

  preferredLocale: 'fr',

  travelPreferences: {
    preferredCountries: ['France', 'Italie', 'Japon'],
    preferredHomeTypes: ['Appartement', 'Maison'],
    minCapacity: 2,
    maxCapacity: 6,
    carExchangeAccepted: true,
    flexibleDates: true,
  },

  averageRating: 4.8,
  reviewsCount: 23,
  exchangesCount: 12,
  homesCount: 2,
};