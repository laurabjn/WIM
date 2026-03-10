import { checkIdentityStatus } from './checkIdentityStatus.usecase';
import * as api from '../infrastructure/identity.api';
import { IdentityStatus } from '../dtos/identityStatus';

describe('checkIdentityStatus use case', () => {
  it('should return identity status from API', async () => {
    jest.spyOn(api, 'fetchIdentityStatus').mockResolvedValueOnce(IdentityStatus.VERIFIED);

    const status = await checkIdentityStatus();

    expect(status).toBe(IdentityStatus.VERIFIED);
  });
});