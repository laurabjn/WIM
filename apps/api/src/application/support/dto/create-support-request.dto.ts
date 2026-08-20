export type SupportTopic =
  | 'account'
  | 'booking'
  | 'exchange'
  | 'payment'
  | 'technical'
  | 'other';

export interface CreateSupportRequestDto {
  topic: SupportTopic;
  subject: string;
  message: string;
}

export interface CreateSupportRequestData extends CreateSupportRequestDto {
  userId: string;
  userEmail: string;
  userFullName?: string | null;
}