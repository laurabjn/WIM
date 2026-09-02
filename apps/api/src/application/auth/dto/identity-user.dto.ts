import { IdentityStatus } from 'src/domain/auth/entities/user.entity';

export interface StartIdentityVerificationInput {
  userId: string;
}

export interface StartIdentityVerificationResult {
  redirectUrl: string;
  returnUrl: string;
}

export interface GetIdentityStatusInput {
  userId: string;
}

export interface GetIdentityStatusResult {
  status: IdentityStatus;
}
