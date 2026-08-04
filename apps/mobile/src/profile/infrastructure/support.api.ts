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
  console.log('SUPPORT STATUS:', response.status);
  console.log('SUPPORT RAW RESPONSE:', rawText);

  if (!response.ok) {
    throw new Error(`Support API error ${response.status}: ${rawText}`);
  }

  try {
    return JSON.parse(rawText) as CreateSupportRequestResponse;
  } catch {
    throw new Error(`Invalid JSON returned by support API: ${rawText}`);
  }
}