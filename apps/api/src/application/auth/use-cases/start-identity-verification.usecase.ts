import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { IdentityVerificationProviderPort } from '../ports/identity-verification-provider.port';
import {
  StartIdentityVerificationInput,
  StartIdentityVerificationResult,
} from '../dto/identity-user.dto';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';

export class StartIdentityVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly provider: IdentityVerificationProviderPort,
  ) {}

  async execute(
    input: StartIdentityVerificationInput,
  ): Promise<StartIdentityVerificationResult> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.identityStatus === IdentityStatus.VERIFIED) {
      throw new Error('Identity already verified');
    }

    const { redirectUrl } = await this.provider.startVerification({
      userId: user.id,
      email: user.email,
    });

    await this.userRepository.updateIdentityStatus(
      user.id,
      IdentityStatus.IN_PROGRESS,
    );

    return { redirectUrl };
  }
}
