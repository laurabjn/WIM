import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';

export class ApplyIdentityVerdictUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: {
    userId: string;
    status: IdentityStatus;
  }): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) return;

    await this.userRepository.updateIdentityStatus(input.userId, input.status);
  }
}
