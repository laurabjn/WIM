import { RegisterUserInput } from '../dto/register-user.dto';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Injectable, Inject } from '@nestjs/common';
import { PasswordHasher } from '../../shared/utils/password-hasher';
import { TOKENS } from '../tokens/tokens';
import { UserAlreadyExistsError } from 'src/domain/errors/user-already-exist.error';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    return this.userRepository.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  }
}
