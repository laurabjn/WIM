export type SupportTopic =
  | 'account'
  | 'booking'
  | 'exchange'
  | 'payment'
  | 'technical'
  | 'other';

// Ce que le client envoie : l'identité de l'auteur n'en fait pas partie, elle
// est résolue côté serveur depuis le token pour qu'on ne puisse pas déposer une
// demande au nom de quelqu'un d'autre.
export interface CreateSupportRequestDto {
  topic: SupportTopic;
  subject: string;
  message: string;
}

// Ce qui est réellement persisté, une fois l'auteur résolu par le use case.
export interface CreateSupportRequestData extends CreateSupportRequestDto {
  userId: string;
  userEmail: string;
  userFullName?: string | null;
}