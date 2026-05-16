export type SupportTopic =
  | 'account'
  | 'booking'
  | 'exchange'
  | 'payment'
  | 'technical'
  | 'other';

export interface CreateSupportRequestDto {
  userId: string;
  userEmail: string;
  userFullName?: string | null;
  topic: SupportTopic;
  subject: string;
  message: string;
}