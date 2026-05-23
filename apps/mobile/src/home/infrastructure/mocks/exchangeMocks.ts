import type { Exchange } from '@wim/shared';

export const exchangeMocks: Exchange[] = [
  {
    id: 'exchange-current-1',
    homeId: 'home-1',
    homeTitle: 'Terry House',
    homeImageUrl:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    location: 'San Francisco, États-Unis',
    startDate: '2026-05-18',
    endDate: '2026-05-25',
    travelersCount: 5,
    status: 'CURRENT',
  },
  {
    id: 'exchange-future-1',
    homeId: 'home-2',
    homeTitle: 'Liam & Bethany home',
    homeImageUrl:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
    location: 'Augusta, États-Unis',
    startDate: '2026-06-25',
    endDate: '2026-08-13',
    travelersCount: 6,
    status: 'FUTURE',
  },
  {
    id: 'exchange-future-2',
    homeId: 'home-3',
    homeTitle: 'Sarah Apartment',
    homeImageUrl:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    location: 'Paris, France',
    startDate: '2026-09-03',
    endDate: '2026-09-12',
    travelersCount: 2,
    status: 'FUTURE',
  },
  {
    id: 'exchange-past-1',
    homeId: 'home-4',
    homeTitle: 'Emma Cottage',
    homeImageUrl:
      'https://images.unsplash.com/photo-1449844908441-8829872d2607',
    location: 'Bordeaux, France',
    startDate: '2026-03-10',
    endDate: '2026-03-17',
    travelersCount: 3,
    status: 'PAST',
  },
];