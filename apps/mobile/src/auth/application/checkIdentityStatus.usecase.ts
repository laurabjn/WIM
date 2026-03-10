import { fetchIdentityStatus } from '../infrastructure/identity.api';
import { IdentityStatus } from '../dtos/identityStatus';

export async function checkIdentityStatus(): Promise<IdentityStatus> {
  return fetchIdentityStatus();
}