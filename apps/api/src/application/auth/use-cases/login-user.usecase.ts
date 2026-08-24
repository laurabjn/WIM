import { ForbiddenException, Injectable, Inject } from '@nestjs/common';
import { PasswordHasher } from '../../../shared/utils/password-hasher';
import { TOKENS } from '../tokens/tokens';
import { LoginUserInput } from '../dto/login-user.dto';
import { InvalidCredentialsError } from 'src/domain/auth/errors/invalid-credentiels.errors';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput) {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

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

    if (user.suspendedAt) {
      throw new ForbiddenException(
        'Ce compte a été suspendu. Contactez le support.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      identityStatus: user.identityStatus,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
