import { randomUUID } from 'crypto';

export enum IdentityStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface CreateUserPayload {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly passwordHash: string,
    public readonly avatarUrl?: string,
    public readonly bio?: string,
    public readonly city?: string,
    public readonly country?: string,
    public readonly languages?: string,
    public readonly isAdmin: boolean = false,
    public readonly identityStatus: IdentityStatus = IdentityStatus.NOT_VERIFIED,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(params: CreateUserPayload): User {
    return new User(
      randomUUID(),
      params.email,
      params.passwordHash,
      params.firstName,
      params.lastName,
    );
  }
}
