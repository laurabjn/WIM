import { API_URL } from '../../config/api';

export type SupportTopic =
  | 'account'
  | 'booking'
  | 'exchange'
  | 'payment'
  | 'technical'
  | 'other';

export interface CreateSupportRequestPayload {
  topic: SupportTopic;
  subject: string;
  message: string;
}

export interface CreateSupportRequestResponse {
  id: string;
  status: string;
  message: string;
}

export async function sendSupportRequest(
  token: string,
  payload: CreateSupportRequestPayload,
): Promise<CreateSupportRequestResponse> {
  const response = await fetch(`${API_URL}/support/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();

  if (!response.ok) {
    // On remonte le message de l'API : l'ecran n'a que celui-la a montrer.
    let message = 'Votre demande n a pas pu etre envoyee.';

    try {
      const body = rawText ? JSON.parse(rawText) : null;

      if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : body.message;
      }
    } catch {
      // Corps illisible : on garde le message generique.
    }

    throw new Error(message);
  }

  try {
    return JSON.parse(rawText) as CreateSupportRequestResponse;
  } catch {
    throw new Error(`Invalid JSON returned by support API: ${rawText}`);
  }
}