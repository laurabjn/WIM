// src/domain/repositories/user.repository.ts

import { User } from '../entities/user.entity';

export interface UserRepository {
  existsByEmail(email: string): Promise<boolean>;
  save(user: User): Promise<void>;
}
