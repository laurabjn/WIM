import type { Review } from '@wim/shared';

export const reviewMocks: Review[] = [
  {
    id: 'review-1',
    score: 5,
    comment:
      'Mon partenaire et moi avons séjourné dans cet appartement et il était tout simplement parfait pour nos 3 jours à San Francisco. C’était propre, lumineux et très bien situé. Nous reviendrons avec plaisir.',
    createdAt: '2026-05-01T12:00:00.000Z',
    author: {
      firstName: 'Terry',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      createdAt: '2018-01-01T00:00:00.000Z',
    },
  },
  {
    id: 'review-2',
    score: 4,
    comment:
      'Très bon séjour dans l’ensemble. Le logement était spacieux et bien équipé. Les échanges avec l’hôte ont été très fluides.',
    createdAt: '2026-04-12T12:00:00.000Z',
    author: {
      firstName: 'Sarah',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      createdAt: '2020-06-01T00:00:00.000Z',
    },
  },
  {
    id: 'review-3',
    score: 5,
    comment:
      'Le quartier est magnifique et très calme. Nous avons adoré notre échange.',
    createdAt: '2026-03-08T12:00:00.000Z',
    author: {
      firstName: 'Emma',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      createdAt: '2019-09-01T00:00:00.000Z',
    },
  },
];