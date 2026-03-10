import { getSession } from "./authStorage";
import { IdentityStatus } from "../dtos/identityStatus";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3002/api';

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