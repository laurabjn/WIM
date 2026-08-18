import { PasswordResetTokenRepository } from 'src/domain/auth/repositories/password-reset-token-repository';
import { ResetPasswordUseCase } from 'src/application/auth/use-cases/reset-password.usecase';
import { InvalidPasswordResetTokenError } from 'src/domain/auth/errors/invalid-password-reset-token.error';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';
import { PasswordHasher } from 'src/shared/utils/password-hasher';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      updateIdentityStatus: jest.fn(),
      touchLastSeen: jest.fn(),
      findLastSeen: jest.fn(),
    } as any;

    tokenRepository = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new ResetPasswordUseCase(
      userRepository,
      tokenRepository,
      passwordHasher,
    );
  });

  it('should reset password when token is valid', async () => {
    tokenRepository.verify.mockResolvedValue({ userId: 'user-1' });
    passwordHasher.hash.mockResolvedValue('new-hash');

    await useCase.execute({ token: 'jwt', newPassword: 'NewPass123' });

    expect(tokenRepository.verify).toHaveBeenCalledWith('jwt');
    expect(passwordHasher.hash).toHaveBeenCalledWith('NewPass123');
    expect(userRepository.updatePasswordHash).toHaveBeenCalledWith(
      'user-1',
      'new-hash',
    );
  });

  it('should throw if token is invalid', async () => {
    tokenRepository.verify.mockRejectedValue(
      new InvalidPasswordResetTokenError(),
    );

    await expect(
      useCase.execute({ token: 'bad', newPassword: 'NewPass123' }),
    ).rejects.toBeInstanceOf(InvalidPasswordResetTokenError);
  });
});
