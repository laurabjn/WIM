import type { PasswordResetTokenRepository } from '../../../domain/auth/repositories/password-reset-token-repository';
import { PasswordHasher } from 'src/shared/utils/password-hasher';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: { token: string; newPassword: string }): Promise<void> {
    const { userId } = await this.tokenRepository.verify(input.token);
    const newHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePasswordHash(userId, newHash);
  }
}
