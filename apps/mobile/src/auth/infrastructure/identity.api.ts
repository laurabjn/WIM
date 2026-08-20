import { API_URL } from '../../config/api';
import { getSession } from "./authStorage";
import { IdentityStatus } from "../dtos/identityStatus";


export async function fetchIdentityStatus(): Promise<IdentityStatus> {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/identity/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch identity status');
  }

  return data.status as IdentityStatus;
}