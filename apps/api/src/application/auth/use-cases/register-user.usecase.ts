import { RegisterUserInput } from '../dto/register-user.dto';
import { Injectable, Inject } from '@nestjs/common';
import { PasswordHasher } from '../../../shared/utils/password-hasher';
import { TOKENS } from '../tokens/tokens';
import { UserAlreadyExistsError } from 'src/domain/auth/errors/user-already-exist.error';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { User } from 'src/domain/auth/entities/user.entity';

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

    const user = await this.userRepository.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
      avatarUrl: input.avatarUrl,
      bio: input.bio,
      country: input.country,
      nationality: input.nationality,
      phone: input.phone,
      birthDate: input.birthDate,
    });

    return user;
  }
}
