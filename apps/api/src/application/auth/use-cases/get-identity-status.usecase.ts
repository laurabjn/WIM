import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import {
  GetIdentityStatusInput,
  GetIdentityStatusResult,
} from '../dto/identity-user.dto';

export class GetIdentityStatusUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: GetIdentityStatusInput,
  ): Promise<GetIdentityStatusResult> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return { status: user.identityStatus };
  }
}
