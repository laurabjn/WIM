import { UserRepository } from '../../domain/repositories/user.repository';
import { Injectable, Inject } from '@nestjs/common';
import { PasswordHasher } from '../../shared/utils/password-hasher';
import { TOKENS } from '../tokens/tokens';
import { InvalidCredentialsError } from 'src/domain/errors/invalid-credentiels.errors';
import { LoginUserInput } from '../dto/login-user.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      identityStatus: user.identityStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
