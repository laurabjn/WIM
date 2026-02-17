// src/application/use-cases/register-user.usecase.ts
import { Email } from '../../domain/value-objects/email.vo';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

type Input = { email: string };
type Output = { userId: string };

export class RegisterUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: Input): Promise<Output> {
    const email = Email.create(input.email);

    const exists = await this.userRepo.existsByEmail(email.value);
    if (exists) throw new Error('Email already used');

    const user = User.create({ email });

    await this.userRepo.save(user);

    return { userId: user.id };
  }
}
