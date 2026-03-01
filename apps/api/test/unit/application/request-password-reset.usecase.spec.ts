import { PasswordResetTokenRepository } from 'src/domain/auth/repositories/password-reset-token-repository';
import { RequestPasswordResetUseCase } from 'src/application/auth/use-cases/request-password-reset.usecase';
import { IdentityStatus } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepository>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
    };

    tokenRepository = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    useCase = new RequestPasswordResetUseCase(
      userRepository,
      tokenRepository,
      3600,
    );
  });

  it('should return a reset token when user exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hash',
      firstName: 'Laura',
      lastName: 'Bojon',
      isAdmin: false,
      identityStatus: IdentityStatus.NOT_VERIFIED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    tokenRepository.sign.mockResolvedValue('jwt-reset-token');

    const result = await useCase.execute('test@example.com');

    expect(tokenRepository.sign).toHaveBeenCalledWith(
      { userId: 'user-1' },
      3600,
    );
    expect(result).toEqual({ token: 'jwt-reset-token' });
  });

  it('should not reveal if user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute('unknown@example.com');

    expect(tokenRepository.sign).not.toHaveBeenCalled();
    expect(result).toEqual({ token: null });
  });
});
