import { CreateUserPayload, User } from '../entities/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(payload: CreateUserPayload): Promise<User>;
}
