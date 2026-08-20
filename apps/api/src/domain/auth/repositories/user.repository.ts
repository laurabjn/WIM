import {
  CreateUserPayload,
  IdentityStatus,
  User,
} from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(payload: CreateUserPayload): Promise<User>;
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  updateIdentityStatus(userId: string, status: IdentityStatus): Promise<void>;
  touchLastSeen(userId: string): Promise<void>;
  findLastSeen(userIds: string[]): Promise<Record<string, string | null>>;
}
