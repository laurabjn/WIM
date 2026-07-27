export type MockUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type MockMatch = {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'ACCEPTED';
  createdAt: string;
};

export type MockChat = {
  id: string;
  matchId: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
  messages: MockMessage[];
};

export type MockMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export const chatsMock: MockChat[] = [];

/**
 * Utilisateur actuellement connecté dans le scénario mock.
 *
 * Les logements générés commencent avec :
 * - home-1 appartenant à user-2
 * - home-2 appartenant à user-3
 * - etc.
 */
export const currentUserMock: MockUser = {
  id: 'user-1',
  firstName: 'Laura',
  lastName: 'Bojon',
  avatarUrl: null,
};

/**
 * Ces utilisateurs ont déjà liké l’utilisateur connecté.
 *
 * Si Laura like l’un de leurs logements,
 * le swipe devient un match.
 */
export const reciprocalLikesMock: string[] = [
  'user-2',
  'user-5',
  'user-8',
  'user-12',
];

/**
 * Stockage temporaire des matchs créés pendant la session.
 *
 * Ce tableau est remis à zéro lorsque l’application redémarre.
 */
export const matchesMock: MockMatch[] = [];