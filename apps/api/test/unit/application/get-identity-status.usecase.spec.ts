import { GetIdentityStatusUseCase } from 'src/application/auth/use-cases/get-identity-status.usecase';
import { IdentityStatus, User } from 'src/domain/auth/entities/user.entity';
import { UserRepository } from 'src/domain/auth/repositories/user.repository';

describe('GetIdentityStatusUseCase', () => {
  let useCase: GetIdentityStatusUseCase;
  let userRepository: jest.Mocked<UserRepository>;

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
    identityStatus: IdentityStatus.IN_PROGRESS,
    createdAt: new Date(),
    updatedAt: new Date(),
    suspendedAt: null,
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

    useCase = new GetIdentityStatusUseCase(userRepository);
  });

  it('should return identity status for user', async () => {
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ status: IdentityStatus.IN_PROGRESS });
  });

  it('should throw if user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'unknown' })).rejects.toThrowError(
      'User not found',
    );
  });
});
