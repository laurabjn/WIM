// src/domain/entities/user.entity.ts
import { randomUUID } from 'crypto';
import { Email } from '../value-objects/email.vo';

type CreateUserParams = {
  email: Email;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
  ) {}

  static create(params: CreateUserParams): User {
    return new User(randomUUID(), params.email);
  }
}
