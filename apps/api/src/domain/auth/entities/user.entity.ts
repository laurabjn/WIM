import { randomUUID } from 'crypto';
import type { User as PrismaUser } from '@prisma/client';

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
  avatarUrl: string;
  bio: string;
  country: string;
  nationality: string;
  phone: string;
  birthDate: string;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly passwordHash: string,
    public readonly avatarUrl: string,
    public readonly bio: string,
    public readonly country: string,
    public readonly nationality: string,
    public readonly phone: string,
    public readonly birthDate: string,
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
      params.firstName,
      params.lastName,
      params.passwordHash,
      params.avatarUrl,
      params.bio,
      params.country,
      params.nationality,
      params.phone,
      params.birthDate,
      '',
      false,
      IdentityStatus.NOT_VERIFIED,
      new Date(),
      new Date(),
    );
  }

  /**
   */
  static fromPersistence(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.firstName,
      prismaUser.lastName,
      prismaUser.passwordHash,
      prismaUser.avatarUrl,
      prismaUser.bio,
      prismaUser.country,
      prismaUser.nationality ?? '',
      prismaUser.phone,
      prismaUser.birthDate?.toISOString() ?? '',
      prismaUser.languages ? JSON.stringify(prismaUser.languages) : '',
      prismaUser.isAdmin,
      prismaUser.identityStatus as IdentityStatus,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}
