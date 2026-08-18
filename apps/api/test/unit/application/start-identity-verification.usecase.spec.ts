import { IdentityVerificationProviderPort } from 'src/application/auth/ports/identity-verification-provider.port';
import { StartIdentityVerificationUseCase } from 'src/application/auth/use-cases/start-identity-verification.usecase';
import { IdentityStatus, User } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';

describe('StartIdentityVerificationUseCase', () => {
  let useCase: StartIdentityVerificationUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let provider: jest.Mocked<IdentityVerificationProviderPort>;

  const user: User = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hash',
    firstName: 'Laura',
    lastName: 'Bojon',
    avatarUrl: null,
    bio: null,
    country: null,
    nationality: null,
    phone: null,
    birthDate: null,
    languages: null,
    isAdmin: false,
    identityStatus: IdentityStatus.NOT_VERIFIED,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      updateIdentityStatus: jest.fn(),
      touchLastSeen: jest.fn(),
      findLastSeen: jest.fn(),
    };

    provider = {
      startVerification: jest.fn(),
    };

    useCase = new StartIdentityVerificationUseCase(userRepository, provider);
  });

  it('should start verification and set status to IN_PROGRESS', async () => {
    userRepository.findById.mockResolvedValue(user);
    provider.startVerification.mockResolvedValue({
      redirectUrl: 'https://mock-kyc.com/session/abc',
    });

    const result = await useCase.execute({ userId: 'user-1' });

    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    expect(provider.startVerification).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'test@example.com',
    });
    expect(userRepository.updateIdentityStatus).toHaveBeenCalledWith(
      'user-1',
      IdentityStatus.IN_PROGRESS,
    );
    expect(result).toEqual({
      redirectUrl: 'https://mock-kyc.com/session/abc',
    });
  });

  it('should throw if user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'unknown' })).rejects.toThrowError(
      'User not found',
    );
  });

  it('should not restart verification if already VERIFIED', async () => {
    userRepository.findById.mockResolvedValue({
      ...user,
      identityStatus: IdentityStatus.VERIFIED,
    });

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrowError(
      'Identity already verified',
    );
  });
});
